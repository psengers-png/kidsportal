const { getUser } = require('../createCheckout/utils/db');
const { ensureTables, getAccountEntity, upsertAccountEntity } = require('../../utils/experienceBoxStorage');

const ALLOWED_ORIGINS = [
    "https://www.rainydayclub.nl",
    "https://rainydayclub.nl"
];

function buildCorsHeaders(req) {
    const requestOrigin = req.headers?.origin || req.headers?.Origin;
    const allowOrigin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, user-id, authorization",
        "Vary": "Origin"
    };
}

module.exports = async function(context, req) {
    const corsHeaders = buildCorsHeaders(req);

    if (req.method === "OPTIONS") {
        context.res = { status: 204, headers: corsHeaders, body: "" };
        return;
    }

    const userId = req.headers['user-id'];

    console.log("Headers received:", req.headers);
    console.log("User ID received:", userId);

    if (!userId) {
        context.res = { status: 400, headers: corsHeaders, body: "Missing user-id header" };
        return;
    }

    try {
        const user = await getUser(userId);

        console.log("User fetched from database:", user);

        if (!user) {
            context.res = { status: 404, headers: corsHeaders, body: { error: "User not found" } };
            return;
        }

        try {
            await ensureTables();
            const existingExperienceAccount = await getAccountEntity(userId);
            const nowIso = new Date().toISOString();
            await upsertAccountEntity({
                ...(existingExperienceAccount || {}),
                partitionKey: 'ACCOUNT',
                rowKey: userId,
                email: user.email || existingExperienceAccount?.email || '',
                name: user.name || existingExperienceAccount?.name || 'Unknown',
                planType: user.planType || existingExperienceAccount?.planType || 'gratis',
                planStatus: user.planStatus || existingExperienceAccount?.planStatus || 'gratis',
                activated: user.isActive === true || existingExperienceAccount?.activated === true,
                activatedAt: existingExperienceAccount?.activatedAt || (user.isActive === true ? nowIso : null),
                creditsBalance: Number(user.creditsBalance || existingExperienceAccount?.creditsBalance || 0),
                maxRequests: Number(user.maxRequests || existingExperienceAccount?.maxRequests || 0),
                createdAt: existingExperienceAccount?.createdAt || user.created || nowIso,
                updatedAt: nowIso
            });
        } catch (syncError) {
            console.warn('Could not sync blob user to ExperienceAccounts:', syncError?.message || syncError);
        }

        const planType = (user.planType || user.plan || 'gratis').toString().toLowerCase();
        const hasPaidPlanType = planType === 'particulier' || planType === 'enterprise' || planType === 'betaald';
        const hasActiveSubscriptionMarker = Boolean(user.stripeSubscriptionId) || user.planStatus === 'active' || hasPaidPlanType;
        const isMarkedActive = user.isActive === true || user.IsActive === true;
        const preferredPlanType = user.preferredPlanType || null;
        const requestsUsed = (user.requestsUsed && typeof user.requestsUsed === 'object') ? user.requestsUsed : {};
        const totalRequestsUsed = Object.values(requestsUsed).reduce((sum, count) => sum + (Number(count) || 0), 0);
        const maxRequests = Number(user.maxRequests || 25);
        const subscriptionCanceledAt = user.subscriptionCanceledAt || null;
        const subscriptionEndsAt = user.subscriptionEndsAt || null;
        const subscriptionExpired = subscriptionEndsAt && new Date(subscriptionEndsAt) < new Date();
        const isActive = (isMarkedActive && hasActiveSubscriptionMarker) && !subscriptionExpired;
        const planStatus = subscriptionExpired
            ? 'cancelled'
            : (user.planStatus || (isActive ? 'active' : 'inactive'));
        console.log("Response body being sent:", { isActive, planType, planStatus, preferredPlanType, requestsUsed, totalRequestsUsed, maxRequests, subscriptionCanceledAt, subscriptionEndsAt });
        context.res = {
            status: 200,
            headers: corsHeaders,
            body: {
                isActive,
                planType,
                planStatus,
                preferredPlanType,
                subscriptionCanceledAt,
                subscriptionEndsAt,
                requestsUsed,
                totalRequestsUsed,
                maxRequests
            }
        };
    } catch (error) {
        console.error("Error fetching user status:", error);
        context.res = { status: 500, headers: corsHeaders, body: "Failed to fetch user status" };
    }
};