-- 025: Lock down GraphQL schema exposure by tightening table SELECT grants
-- Fixes:
-- - pg_graphql_anon_table_exposed
-- - pg_graphql_authenticated_table_exposed

BEGIN;

-- Public exposure through anon role
REVOKE SELECT ON TABLE public.services FROM anon;

-- Broad exposure through authenticated role
REVOKE SELECT ON TABLE public.booking_history FROM authenticated;
REVOKE SELECT ON TABLE public.bookings FROM authenticated;
REVOKE SELECT ON TABLE public.client_assignments FROM authenticated;
REVOKE SELECT ON TABLE public.contracts FROM authenticated;
REVOKE SELECT ON TABLE public.deliverables FROM authenticated;
REVOKE SELECT ON TABLE public.invitations FROM authenticated;
REVOKE SELECT ON TABLE public.invoices FROM authenticated;
REVOKE SELECT ON TABLE public.milestone_notifications FROM authenticated;
REVOKE SELECT ON TABLE public.milestone_updates FROM authenticated;
REVOKE SELECT ON TABLE public.profiles FROM authenticated;
REVOKE SELECT ON TABLE public.project_milestones FROM authenticated;
REVOKE SELECT ON TABLE public.rotation_members FROM authenticated;
REVOKE SELECT ON TABLE public.rotation_state FROM authenticated;
REVOKE SELECT ON TABLE public.services FROM authenticated;
REVOKE SELECT ON TABLE public.subscriptions FROM authenticated;

COMMIT;
