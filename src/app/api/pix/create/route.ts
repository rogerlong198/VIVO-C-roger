import { NextRequest, NextResponse } from "next/server";
import { generateValidCpf } from "@/lib/cpf";

interface MockIdentity {
  name: string;
  email: string;
}

const FIRST_NAMES = [
  "Ana", "André", "Beatriz", "Bruno", "Camila", "Carla", "Carlos", "César",
  "Daniel", "Daniela", "Diego", "Eduardo", "Elaine", "Fábio", "Felipe",
  "Fernanda", "Gabriel", "Gabriela", "Gustavo", "Henrique", "Igor", "Isabela",
  "João", "Juliana", "Kelvin", "Larissa", "Leonardo", "Letícia", "Lucas",
  "Marcos", "Mariana", "Matheus", "Natália", "Paula", "Pedro", "Rafael",
  "Rafaela", "Renato", "Ricardo", "Roberta", "Rodrigo", "Sabrina", "Sérgio",
  "Thiago", "Vanessa", "Victor", "Vinicius", "Yasmin", "Amanda", "Alexandre",
];

const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
  "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
  "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
  "Dias", "Nascimento", "Araújo", "Moreira", "Cavalcanti", "Monteiro",
  "Cardoso", "Reis", "Castro", "Pinto", "Teixeira", "Correia", "Nunes",
  "Moura", "Mendes", "Freitas", "Campos", "Batista", "Guimarães",
];

const EMAIL_DOMAINS = ["gmail.com", "icloud.com"];

function removeAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIdentity(): MockIdentity {
  const first = pick(FIRST_NAMES);
  const last1 = pick(LAST_NAMES);
  const useTwoLast = Math.random() < 0.4;
  const last2 = useTwoLast ? pick(LAST_NAMES.filter((l) => l !== last1)) : null;
  const name = last2 ? `${first} ${last1} ${last2}` : `${first} ${last1}`;

  const firstSlug = removeAccents(first).toLowerCase();
  const lastSlug = removeAccents(last1).toLowerCase();
  const sepRoll = Math.random();
  const separator = sepRoll < 0.4 ? "" : sepRoll < 0.8 ? "." : "_";
  const suffix = Math.random() < 0.65 ? String(Math.floor(Math.random() * 1000)) : "";
  const domain = pick(EMAIL_DOMAINS);
  const email = `${firstSlug}${separator}${lastSlug}${suffix}@${domain}`;

  return { name, email };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { value, phone } = body;

    if (!value || !phone) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes: value, phone" },
        { status: 400 }
      );
    }

    const key = process.env.PAGOUAI_SECRET_KEY?.trim();
    if (!key) {
      console.error("[pix] PAGOUAI_SECRET_KEY não configurada");
      return NextResponse.json(
        { error: "Configuração de pagamento ausente no servidor" },
        { status: 500 }
      );
    }

    const BASE_URL = process.env.PAGOUAI_BASE_URL ?? "https://api.conta.pagou.ai";
    const url = `${BASE_URL}/v1/transactions`;

    // Basic Auth: base64("KEY:x")
    const auth = Buffer.from(`${key}:x`).toString("base64");

    // Telefone real do cliente (mantido pra exibição na resposta e no customer da Pagou)
    const phoneDigits = String(phone).replace(/\D/g, "");

    // Data de expiração: 1 hora a partir de agora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const expirationDate = expiresAt.toISOString().split("T")[0];

    // Identidade mock pra Pagou — nome e email gerados por request, CPF gerado válido
    const mock = generateIdentity();

    const payload = {
      amount: Math.round(value * 100),
      paymentMethod: "pix",
      customer: {
        name: mock.name,
        email: mock.email,
        phone: phoneDigits,
        document: {
          number: generateValidCpf(),
          type: "cpf",
        },
      },
      items: [
        {
          title: "Promoção Escolhida",
          quantity: 1,
          unitPrice: Math.round(value * 100),
          tangible: false,
        },
      ],
      pix: {
        expirationDate,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[pix] endpoint:", url);
      console.error("[pix] status:", response.status, JSON.stringify(data));
      return NextResponse.json(
        {
          error: "Erro no gateway de pagamento",
          detail: data?.message ?? data?.error ?? JSON.stringify(data),
        },
        { status: 502 }
      );
    }

    console.log("[pix] resposta da pagou.ai:", JSON.stringify(data));

    // A Pagou AI pode retornar o código PIX em campos diferentes — tentamos vários
    const qrCode =
      data.pix?.qrcode ??
      data.pix?.qrCode ??
      data.pix?.payload ??
      data.pix?.code ??
      data.pix?.emv ??
      data.qrcode ??
      data.qrCode ??
      data.payload ??
      data.code ??
      null;

    const apiExpiresAt =
      data.pix?.expirationDate ??
      data.pix?.expiresAt ??
      data.pix?.expiration ??
      data.expiresAt ??
      data.expirationDate ??
      null;

    if (!qrCode) {
      console.error("[pix] resposta sem código PIX. Payload completo:", JSON.stringify(data));
      return NextResponse.json(
        {
          error: "Resposta inválida do gateway",
          detail: "Código PIX não retornado pela Pagou AI. Verifique se sua conta tem PIX habilitado.",
        },
        { status: 502 }
      );
    }

    // Garante que expiresAt seja sempre um ISO completo (não apenas YYYY-MM-DD)
    let expiresIso = expiresAt.toISOString();
    if (apiExpiresAt) {
      const parsed = new Date(apiExpiresAt);
      // Se for só uma data (YYYY-MM-DD), usamos nosso fallback de 1 hora
      if (!isNaN(parsed.getTime()) && String(apiExpiresAt).length > 10) {
        expiresIso = parsed.toISOString();
      }
    }

    return NextResponse.json({
      txid: data.id ?? data.txid ?? data.transactionId,
      qrCode,
      expiresAt: expiresIso,
      amount: value,
      phone: phoneDigits,
    });
  } catch (err) {
    console.error("[pix] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
