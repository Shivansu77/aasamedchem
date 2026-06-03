import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import QuotationDetail from "@/components/seller/QuotationDetail";

export const dynamic = "force-dynamic";

export default async function SellerQuotationDetailPage({ params }) {
  const resolvedParams = await params;
  const quotationId = Number(resolvedParams?.id);
  if (!Number.isFinite(quotationId)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const quotationResult = await db.execute(sql`
    SELECT q.*
    FROM quotations q
    WHERE q.id = ${quotationId} AND q.user_id = ${session.user.id}
  `);

  const quotation = quotationResult.rows[0];
  if (!quotation) {
    notFound();
  }

  const itemsResult = await db.execute(sql`
    SELECT 
      qi.*,
      p.name as product_name,
      p.sku as product_sku,
      p.cas_number as product_cas,
      p.category as product_category,
      p.image_url as product_image_url,
      u.name as unit_name,
      u.abbreviation as unit_abbreviation
    FROM quotation_items qi
    JOIN products p ON qi.product_id = p.id
    JOIN units u ON qi.unit_id = u.id
    WHERE qi.quotation_id = ${quotationId}
    ORDER BY qi.id ASC
  `);

  quotation.items = itemsResult.rows;

  return <QuotationDetail quotation={quotation} />;
}
