-- AlterTable: hub_member_id BigInt → VarChar(30)
-- Hub auth_member.id was changed from BigInt to VarChar(30) (FixMemberIdType migration)
-- Align sv_auth_member.hub_member_id to match the actual Hub member ID format (e.g. S26H201011)
ALTER TABLE "saenggiview"."sv_auth_member" ALTER COLUMN "hub_member_id" TYPE VARCHAR(30) USING hub_member_id::text;
