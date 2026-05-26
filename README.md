# TAARA Admin — Dashboard React

Console d'administration de la plateforme TAARA.

## Stack

- React 18 + TypeScript + Vite 6
- Tailwind CSS 3 (design system custom)
- TanStack Query v5 (data fetching + cache)
- React Router 7
- Zustand (auth store persistant)
- Axios (avec interceptor de refresh JWT)
- Lucide React (icônes)
- React Hot Toast (notifications)
- Recharts (graphiques — préparé pour la roadmap)

## Démarrage

```bash
cd admin
cp .env.example .env
npm install
npm run dev    # http://localhost:5173
```

Le `vite.config.ts` proxifie `/api/*` vers `http://localhost:3000` en dev.

## Pages

| Route             | Description                                        |
|-------------------|----------------------------------------------------|
| `/login`          | Connexion (réservée aux comptes ADMIN)             |
| `/`               | Dashboard (KPI users, jobs, revenus, diagnostics)  |
| `/users`          | Liste users + filtre par rôle + ban/débanir        |
| `/professionals`  | Cards pros + vérification / dévérification         |
| `/jobs`           | Liste jobs + filtre par statut                     |
| `/withdrawals`    | Retraits en attente + validation manuelle          |

## Auth

- Login → stockage `accessToken` + `refreshToken` dans Zustand persistant (localStorage)
- Axios interceptor : ajoute le Bearer + refresh automatique en cas de 401
- Route guard `RequireAdmin` : redirige vers `/login` si non-admin

## Build prod

```bash
npm run build      # → admin/dist/
npm run preview    # test du build
```

## Déploiement

Le bundle statique de `dist/` peut être servi par :
- Firebase Hosting
- Cloudflare Pages
- Cloud Run (avec un container nginx)
- ou directement par le NestJS via `app.useStaticAssets()` en prod

## Compte admin de test

Après `prisma:seed` sur le backend :

```
admin@taara.app / admin12345
```
