import { NextRequest } from "next/server";

// This route expects form-data with keys:
// photos[] (files), documents[] (files), metadata (JSON string of fields)
// Uses Pinata JWT (set PINATA_JWT in env) to pin files and JSON metadata

const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

async function pinFileToIPFS(file: File, jwt: string): Promise<string> {
  const fd = new FormData();
  // @ts-ignore: web File is acceptable
  fd.append("file", file as any, file.name);
  const res = await fetch(PINATA_FILE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata file error: ${res.status} ${text}`);
  }
  const json = await res.json();
  return `ipfs://${json.IpfsHash}`;
}

async function pinJSONToIPFS(payload: any, jwt: string): Promise<string> {
  const res = await fetch(PINATA_JSON_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata JSON error: ${res.status} ${text}`);
  }
  const json = await res.json();
  return `ipfs://${json.IpfsHash}`;
}

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing PINATA_JWT" }), { status: 500 });
    }

    const formData = await req.formData();

    const photos = formData.getAll("photos").filter(Boolean) as File[];
    const documents = formData.getAll("documents").filter(Boolean) as File[];
    const metadataStr = (formData.get("metadata") as string) || "{}";
    const base = JSON.parse(metadataStr || "{}");

    const photoCids: string[] = [];
    for (const f of photos) {
      const cid = await pinFileToIPFS(f, jwt);
      photoCids.push(cid);
    }

    const docCids: string[] = [];
    for (const f of documents) {
      const cid = await pinFileToIPFS(f, jwt);
      docCids.push(cid);
    }

    const metadata = {
      ...base,
      files: { photos: photoCids, documents: docCids },
      timestamps: { ...(base.timestamps || {}), createdAt: Math.floor(Date.now() / 1000) },
    };

    const metadataCid = await pinJSONToIPFS(metadata, jwt);

    return new Response(
      JSON.stringify({ metadataCid, photos: photoCids, documents: docCids, metadata }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Upload failed" }), { status: 500 });
  }
}
