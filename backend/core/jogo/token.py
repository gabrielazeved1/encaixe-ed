import base64
import hashlib
import hmac
import json
import time
from typing import TypedDict

from core.jogo.operacoes import OPERACOES


TTL_SEGUNDOS = 3600

ESTRUTURAS_VALIDAS = {
    "pilha",
    "fila",
    "heap",
    "hash",
    "bst",
    "linkedlist",
    "grafo",
}


class ClaimsRodada(TypedDict):
    e: str
    op: str
    s: int
    t: int


class TokenInvalido(Exception):
    pass


class TokenExpirado(Exception):
    pass


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64url_decode(s: str) -> bytes:
    padding = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)


def _assinar(payload: bytes, secret: bytes) -> bytes:
    return hmac.new(secret, payload, hashlib.sha256).digest()


def encode(claims: ClaimsRodada, secret: bytes) -> str:
    payload_json = json.dumps(claims, sort_keys=True, separators=(",", ":")).encode(
        "utf-8"
    )
    payload_b64 = _b64url_encode(payload_json)
    assinatura = _assinar(payload_json, secret)
    assinatura_b64 = _b64url_encode(assinatura)
    return f"{payload_b64}.{assinatura_b64}"


def decode(
    token: str, secret: bytes, agora: int | None = None
) -> ClaimsRodada:
    if agora is None:
        agora = int(time.time())

    if "." not in token:
        raise TokenInvalido("formato inválido")

    partes = token.split(".")
    if len(partes) != 2:
        raise TokenInvalido("formato inválido")

    payload_b64, assinatura_b64 = partes
    try:
        payload_json = _b64url_decode(payload_b64)
        assinatura = _b64url_decode(assinatura_b64)
    except (ValueError, Exception) as exc:
        raise TokenInvalido("base64 inválido") from exc

    esperada = _assinar(payload_json, secret)
    if not hmac.compare_digest(esperada, assinatura):
        raise TokenInvalido("assinatura inválida")

    try:
        claims = json.loads(payload_json)
    except json.JSONDecodeError as exc:
        raise TokenInvalido("json inválido") from exc

    if not isinstance(claims, dict):
        raise TokenInvalido("claims não é objeto")
    if set(claims.keys()) != {"e", "op", "s", "t"}:
        raise TokenInvalido("claims com chaves inesperadas")
    if claims["e"] not in ESTRUTURAS_VALIDAS:
        raise TokenInvalido("estrutura desconhecida")
    if not isinstance(claims["s"], int) or not isinstance(claims["t"], int):
        raise TokenInvalido("tipos inválidos")
    if not isinstance(claims["op"], str):
        raise TokenInvalido("op com tipo inválido")
    ops_validas = {op.nome for op in OPERACOES[claims["e"]]}
    if claims["op"] not in ops_validas:
        raise TokenInvalido("op desconhecida para a estrutura")

    if agora - claims["t"] >= TTL_SEGUNDOS:
        raise TokenExpirado("rodada expirada")

    return claims
