import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/db/client";

interface ClerkUserEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    first_name: string | null;
    last_name: string | null;
    primary_email_address_id: string;
  };
}

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    );
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ");

    await prisma.user.create({
      data: {
        id: data.id,
        email: primaryEmail?.email_address ?? "",
        name: name || null,
      },
    });
  }

  if (type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    );
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ");

    await prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: primaryEmail?.email_address ?? "",
        name: name || null,
      },
      create: {
        id: data.id,
        email: primaryEmail?.email_address ?? "",
        name: name || null,
      },
    });
  }

  if (type === "user.deleted") {
    await prisma.user.delete({ where: { id: data.id } }).catch(() => {});
  }

  return new Response("OK", { status: 200 });
}
