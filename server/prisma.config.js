import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  experimental: {
    externalTables: true,
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
  },
  tables: {
    external: [
      'auth.audit_log_entries',
      'auth.custom_oauth_providers',
      'auth.flow_state',
      'auth.identities',
      'auth.instances',
      'auth.mfa_amr_claims',
      'auth.mfa_challenges',
      'auth.mfa_factors',
      'auth.oauth_authorizations',
      'auth.oauth_client_states',
      'auth.oauth_clients',
      'auth.oauth_consents',
      'auth.one_time_tokens',
      'auth.refresh_tokens',
      'auth.saml_providers',
      'auth.saml_relay_states',
      'auth.schema_migrations',
      'auth.sessions',
      'auth.sso_domains',
      'auth.sso_providers',
      'auth.users',
      'auth.webauthn_challenges',
      'auth.webauthn_credentials',
      'public.addresses',
      'public.cart_items',
      'public.carts',
      'public.orders',
      'public.products_legacy_backup_20260714054552',
      'public.profiles',
      'public.serviceable_states',
      'public.user_recent_searches',
      'public.wishlists',
    ],
  },
  enums: {
    external: [
      'auth.aal_level',
      'auth.code_challenge_method',
      'auth.factor_status',
      'auth.factor_type',
      'auth.oauth_authorization_status',
      'auth.oauth_client_type',
      'auth.oauth_registration_type',
      'auth.oauth_response_type',
      'auth.one_time_token_type',
    ],
  },
});
