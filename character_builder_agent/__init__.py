import json
import os
import random

import azure.functions as func
from openai import OpenAI

API_KEY = (os.environ.get("OPENAI_API_KEY") or "").strip()
MODEL_NAME = (os.environ.get("OPENAI_MODEL") or "gpt-5").strip() or "gpt-5"
OPENAI_CLIENT = OpenAI(api_key=API_KEY) if API_KEY else None

CHARACTER_TYPES = [
    {"id": "draak", "label": "Draak", "emoji": "🐉"},
    {"id": "robot", "label": "Robot", "emoji": "🤖"},
    {"id": "elf", "label": "Elf", "emoji": "🧝"},
    {"id": "superheld", "label": "Superheld", "emoji": "🦸"},
    {"id": "dier", "label": "Dier", "emoji": "🐶"},
]

APPEARANCE_CONFIG = {
    "kleur": {
        "max": 1,
        "options": [
            {"id": "rood", "label": "Rood"},
            {"id": "blauw", "label": "Blauw"},
            {"id": "regenboog", "label": "Regenboog"},
            {"id": "groen", "label": "Groen"},
        ],
    },
    "bouw": {
        "max": 1,
        "options": [
            {"id": "groot", "label": "Groot"},
            {"id": "klein", "label": "Klein"},
            {"id": "dik", "label": "Dik"},
            {"id": "dun", "label": "Dun"},
        ],
    },
    "ogen": {
        "max": 1,
        "options": [
            {"id": "grote_ogen", "label": "Grote ogen"},
            {"id": "glow_ogen", "label": "Glow ogen"},
            {"id": "drie_ogen", "label": "3 ogen"},
        ],
    },
    "accessoires": {
        "max": 2,
        "options": [
            {"id": "hoed", "label": "Hoed"},
            {"id": "bril", "label": "Bril"},
            {"id": "zwaard", "label": "Zwaard"},
            {"id": "rugzak", "label": "Rugzak"},
        ],
    },
}

SPECIAL_POWERS = [
    {"id": "vuur_spuwen", "label": "Vuur spuwen"},
    {"id": "ijs_magie", "label": "IJs magie"},
    {"id": "onzichtbaar", "label": "Onzichtbaar"},
    {"id": "vliegen", "label": "Vliegen"},
    {"id": "supersnel", "label": "Supersnel"},
]

PERSONALITY_TRAITS = [
    {"id": "grappig", "label": "Grappig"},
    {"id": "dapper", "label": "Dapper"},
    {"id": "slim", "label": "Slim"},
    {"id": "zorgzaam", "label": "Zorgzaam"},
    {"id": "ondeugend", "label": "Ondeugend"},
]

WORLDS = [
    {"id": "bos", "label": "Bos"},
    {"id": "ruimte", "label": "Ruimte"},
    {"id": "onderwater", "label": "Onderwater"},
    {"id": "kasteel", "label": "Kasteel"},
]

NAME_PARTS = {
    "start": ["Dra", "Zi", "Lu", "Ka", "Mo", "Ro", "Fi", "No"],
    "end": ["ko", "ppy", "na", "zor", "lio", "tron", "vix", "ra"],
}


def _response(payload, status=200, headers=None):
    return func.HttpResponse(
        json.dumps(payload, ensure_ascii=False),
        status_code=status,
        mimetype="application/json",
        headers=headers,
    )


def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    }


def _label_map(items):
    return {item["id"]: item["label"] for item in items}


def _validate_one_of(value, allowed, field_name, errors):
    if value not in allowed:
        errors.append(f"{field_name} heeft een ongeldige waarde")


def _validate_list(values, allowed, minimum, maximum, field_name, errors):
    if not isinstance(values, list):
        errors.append(f"{field_name} moet een lijst zijn")
        return []

    unique_values = []
    seen = set()
    for value in values:
        if not isinstance(value, str):
            continue
        if value in seen:
            continue
        seen.add(value)
        unique_values.append(value)

    if len(unique_values) < minimum:
        errors.append(f"{field_name} moet minimaal {minimum} keuze(s) bevatten")
    if len(unique_values) > maximum:
        errors.append(f"{field_name} mag maximaal {maximum} keuze(s) bevatten")

    invalid = [value for value in unique_values if value not in allowed]
    if invalid:
        errors.append(f"{field_name} bevat ongeldige waarde(s): {', '.join(invalid)}")

    return unique_values


def _flow_definition():
    return {
        "title": "Bouw je eigen karakter",
        "version": 1,
        "steps": [
            {
                "id": "soort",
                "title": "Soort karakter",
                "required": True,
                "max": 1,
                "allow_custom": True,
                "options": CHARACTER_TYPES,
            },
            {
                "id": "uiterlijk",
                "title": "Uiterlijk",
                "required": True,
                "groups": APPEARANCE_CONFIG,
                "ui_hint": "Toon per keer 3-4 keuzes om het speels te houden.",
            },
            {
                "id": "krachten",
                "title": "Speciale krachten",
                "required": True,
                "min": 1,
                "max": 2,
                "options": SPECIAL_POWERS,
            },
            {
                "id": "persoonlijkheid",
                "title": "Persoonlijkheid",
                "required": True,
                "min": 2,
                "max": 2,
                "options": PERSONALITY_TRAITS,
            },
            {
                "id": "wereld",
                "title": "Wereld",
                "required": True,
                "max": 1,
                "options": WORLDS,
            },
            {
                "id": "naam",
                "title": "Naam",
                "required": False,
                "allow_user_input": True,
                "allow_ai_suggestions": True,
            },
        ],
    }


def _fallback_name_suggestions(character_type_label, world_label, amount=3):
    suggestions = []
    prefixes = NAME_PARTS["start"]
    suffixes = NAME_PARTS["end"]
    attempts = 0

    while len(suggestions) < amount and attempts < 30:
        attempts += 1
        name = f"{random.choice(prefixes)}{random.choice(suffixes)}"
        if name not in suggestions:
            suggestions.append(name)

    if len(suggestions) < amount:
        type_hint = (character_type_label or "held")[:3].capitalize()
        world_hint = (world_label or "land")[:3].capitalize()
        suggestions.append(f"{type_hint}{world_hint}")

    return suggestions[:amount]


def _ai_name_suggestions(character_summary, fallback):
    if not OPENAI_CLIENT:
        return fallback

    prompt = (
        "Bedenk 3 korte, kindvriendelijke namen voor dit karakter. "
        "Gebruik alleen letters, maximaal 10 tekens per naam. "
        "Geef alleen JSON: {\"names\": [\"Naam1\", \"Naam2\", \"Naam3\"]}.\n"
        f"Karakter: {character_summary}"
    )

    try:
        completion = OPENAI_CLIENT.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "Je bent een creatieve assistent voor kindernamen.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        raw = (completion.choices[0].message.content or "").strip()
        parsed = json.loads(raw)
        names = parsed.get("names") if isinstance(parsed, dict) else None
        if isinstance(names, list):
            clean = []
            for name in names:
                if isinstance(name, str):
                    value = "".join(ch for ch in name.strip() if ch.isalpha())
                    if value and value not in clean:
                        clean.append(value[:10])
                if len(clean) == 3:
                    break
            if len(clean) >= 2:
                while len(clean) < 3:
                    clean.append(fallback[len(clean)])
                return clean
    except Exception:
        pass

    return fallback


def _build_character(body):
    errors = []

    character_type = (body.get("character_type") or "").strip().lower()
    custom_type = (body.get("custom_type") or "").strip()
    allow_custom_type = bool(body.get("allow_custom_type", True))

    type_map = _label_map(CHARACTER_TYPES)
    if character_type == "zelf_verzonnen" and allow_custom_type and custom_type:
        character_type_label = custom_type
    else:
        _validate_one_of(character_type, set(type_map.keys()), "character_type", errors)
        character_type_label = type_map.get(character_type)

    appearance = body.get("appearance")
    if not isinstance(appearance, dict):
        errors.append("appearance moet een object zijn")
        appearance = {}

    normalized_appearance = {}
    for group, config in APPEARANCE_CONFIG.items():
        group_options = _label_map(config["options"])
        raw_values = appearance.get(group, [])
        values = raw_values if isinstance(raw_values, list) else [raw_values]
        selected = _validate_list(
            values,
            set(group_options.keys()),
            minimum=1 if group != "accessoires" else 0,
            maximum=config["max"],
            field_name=f"appearance.{group}",
            errors=errors,
        )
        normalized_appearance[group] = [group_options[item] for item in selected if item in group_options]

    power_map = _label_map(SPECIAL_POWERS)
    selected_powers = _validate_list(
        body.get("powers", []),
        set(power_map.keys()),
        minimum=1,
        maximum=2,
        field_name="powers",
        errors=errors,
    )
    selected_power_labels = [power_map[item] for item in selected_powers if item in power_map]

    trait_map = _label_map(PERSONALITY_TRAITS)
    selected_traits = _validate_list(
        body.get("personality", []),
        set(trait_map.keys()),
        minimum=2,
        maximum=2,
        field_name="personality",
        errors=errors,
    )
    selected_trait_labels = [trait_map[item] for item in selected_traits if item in trait_map]

    world_map = _label_map(WORLDS)
    world = (body.get("world") or "").strip().lower()
    _validate_one_of(world, set(world_map.keys()), "world", errors)
    world_label = world_map.get(world)

    name = (body.get("name") or "").strip()

    if errors:
        raise ValueError("; ".join(errors))

    character_summary = (
        f"{character_type_label} met kleur {', '.join(normalized_appearance['kleur'])}, "
        f"bouw {', '.join(normalized_appearance['bouw'])}, ogen {', '.join(normalized_appearance['ogen'])}, "
        f"accessoires {', '.join(normalized_appearance['accessoires']) or 'geen'}, "
        f"krachten {', '.join(selected_power_labels)}, persoonlijkheid {', '.join(selected_trait_labels)}, "
        f"wereld {world_label}."
    )

    fallback_names = _fallback_name_suggestions(character_type_label, world_label)
    name_suggestions = _ai_name_suggestions(character_summary, fallback_names)

    final_name = name or name_suggestions[0]

    story_seed = (
        f"{final_name} is een {character_type_label.lower()} die woont in de {world_label.lower()} "
        f"en gebruikt {', '.join(selected_power_labels).lower()} om anderen te helpen."
    )

    image_prompt = (
        f"Kindvriendelijke illustratie van {final_name}, een {character_type_label.lower()} in de {world_label.lower()}, "
        f"met {', '.join(normalized_appearance['kleur']).lower()} kleuren, "
        f"{', '.join(normalized_appearance['bouw']).lower()} bouw, {', '.join(normalized_appearance['ogen']).lower()}, "
        f"accessoires: {', '.join(normalized_appearance['accessoires']).lower() or 'geen'}, "
        f"uitstraling: {', '.join(selected_trait_labels).lower()}"
    )

    return {
        "name": final_name,
        "name_suggestions": name_suggestions,
        "character_profile": {
            "type": character_type_label,
            "appearance": normalized_appearance,
            "powers": selected_power_labels,
            "personality": selected_trait_labels,
            "world": world_label,
        },
        "story_seed": story_seed,
        "image_prompt": image_prompt,
    }


def _suggest_names(body):
    character_type = (body.get("character_type") or "held").strip()
    world = (body.get("world") or "wereld").strip()
    current_name = (body.get("name") or "").strip()

    summary = (
        f"type={character_type}, world={world}, personality={body.get('personality', [])}, "
        f"powers={body.get('powers', [])}"
    )

    fallback_names = _fallback_name_suggestions(character_type, world)
    suggestions = _ai_name_suggestions(summary, fallback_names)

    if current_name and current_name not in suggestions:
        suggestions[0] = current_name

    return {"name_suggestions": suggestions}


def main(req: func.HttpRequest) -> func.HttpResponse:
    headers = _cors_headers()

    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=headers)

    try:
        try:
            body = req.get_json()
        except ValueError:
            body = {}

        action = (body.get("action") or "get_flow").strip().lower()

        if action == "get_flow":
            return _response({"flow": _flow_definition()}, 200, headers)

        if action == "build_character":
            try:
                result = _build_character(body)
                return _response(result, 200, headers)
            except ValueError as validation_error:
                return _response({"error": str(validation_error)}, 400, headers)

        if action == "suggest_names":
            result = _suggest_names(body)
            return _response(result, 200, headers)

        return _response(
            {
                "error": "Ongeldige action. Gebruik: get_flow, build_character of suggest_names"
            },
            400,
            headers,
        )

    except Exception as exc:
        return _response({"error": f"Interne serverfout: {str(exc)}"}, 500, headers)
