/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Set by src/middleware.ts on /admin and /api/admin routes. */
    admin?: import('./admin/auth').AdminUser
  }
}
