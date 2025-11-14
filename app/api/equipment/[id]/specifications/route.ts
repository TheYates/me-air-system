import { NextResponse } from "next/server";
import { db } from "@/db";
import { equipmentSpecifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipmentId = parseInt(id);

    const specs = await db
      .select()
      .from(equipmentSpecifications)
      .where(eq(equipmentSpecifications.equipmentId, equipmentId));

    return NextResponse.json(specs);
  } catch (error) {
    console.error("Error fetching specifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch specifications" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipmentId = parseInt(id);
    const body = await request.json();
    const { specifications } = body;

    if (!Array.isArray(specifications)) {
      return NextResponse.json(
        { error: "Specifications must be an array" },
        { status: 400 }
      );
    }

    // Delete existing specifications
    await db
      .delete(equipmentSpecifications)
      .where(eq(equipmentSpecifications.equipmentId, equipmentId));

    // Insert new specifications
    if (specifications.length > 0) {
      const specsToInsert = specifications
        .filter(
          (spec: any) =>
            spec.specificationKey && spec.specificationKey.trim() !== ""
        )
        .map((spec: any) => ({
          equipmentId,
          specificationKey: spec.specificationKey,
          specificationValue: spec.specificationValue || "",
        }));

      if (specsToInsert.length > 0) {
        await db.insert(equipmentSpecifications).values(specsToInsert);
      }
    }

    const updatedSpecs = await db
      .select()
      .from(equipmentSpecifications)
      .where(eq(equipmentSpecifications.equipmentId, equipmentId));

    return NextResponse.json(updatedSpecs);
  } catch (error) {
    console.error("Error saving specifications:", error);
    return NextResponse.json(
      { error: "Failed to save specifications" },
      { status: 500 }
    );
  }
}

