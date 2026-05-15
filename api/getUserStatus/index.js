const { getUser } = require('../createCheckout/utils/db');
const { ensureTables, getAccountEntity } = require('../../utils/experienceBoxStorage');

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

    function parseAiUsageByType(rawValue) {
        if (typeof rawValue !== 'string' || !rawValue.trim()) {
            return {};
        }

        try {
            const parsed = JSON.parse(rawValue);
            return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    try {
        const user = await getUser(userId);

        console.log("User fetched from database:", user);

        if (!user) {
            context.res = { status: 404, headers: corsHeaders, body: { error: "User not found" } };
            return;
        }

        await ensureTables();
        const experienceAccount = await getAccountEntity(userId);
        const isExperienceAccount = Boolean(
            experienceAccount
            && ((experienceAccount.planType || '').toString().toLowerCase() === 'ai_experience_box' || experienceAccount.activated === true)
        );

        if (isExperienceAccount) {
            const aiRequestsUsedByType = parseAiUsageByType(experienceAccount.aiRequestsUsedByType);
            const aiRequestsUsedTotal = Number(experienceAccount.aiRequestsUsedTotal || 0);

            context.res = {
                status: 200,
                headers: corsHeaders,
                body: {
                    isActive: experienceAccount.activated === true,
                    planType: 'ai_experience_box',
                    planStatus: experienceAccount.activated === true ? 'active' : 'inactive',
                    preferredPlanType: 'ai_experience_box',
                    subscriptionCanceledAt: null,
                    subscriptionEndsAt: null,
                    requestsUsed: aiRequestsUsedByType,
                    totalRequestsUsed: aiRequestsUsedTotal,
                    maxRequests: Number(experienceAccount.maxRequests || 100),
                    creditsBalance: Number(experienceAccount.creditsBalance || 0)
                }
            };
            return;
        }

        const planType = (user.planType || user.plan || 'gratis').toString().toLowerCase();
        const hasPaidPlanType = planType === 'particulier' || planType === 'enterprise' || planType === 'betaald';
        const hasActiveSubscriptionMarker = Boolean(user.stripeSubscriptionId) || user.planStatus === 'active' || hasPaidPlanType;
        const isMarkedActive = user.isActive === true || user.IsActive === true;
        // For non-Experience accounts, never return preferredPlanType='ai_experience_box' to prevent misclassification
        const rawPreferredPlanType = user.preferredPlanType || null;
        const preferredPlanType = (rawPreferredPlanType === 'ai_experience_box') ? null : rawPreferredPlanType;
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
                maxRequests,
                creditsBalance: Number(user.creditsBalance || 0)
            }
        };
    } catch (error) {
        console.error("Error fetching user status:", error);
        context.res = { status: 500, headers: corsHeaders, body: "Failed to fetch user status" };
    }
};