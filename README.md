# Patxi Training Site

Site statique Astro pour la formation Sylius.

## Commandes utiles

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run deploy`

Les scripts par défaut pointent vers le flux Astro.

## Architecture

- `src/pages/**/*.astro` : routes publiques
- `src/components/*.astro` : composants de rendu statique
- `src/controllers/*_controller.ts` : logique client Stimulus
- `src/lib/*.ts` : helpers partagés
- `src/data/*.json` : contenu
- `public/` : assets copiés tels quels

Le site public n’utilise plus React. L’interactivité client restante est isolée dans des controllers Stimulus.

## Déploiement

Le build Astro est publié sur la branche GitHub Pages `prerender` via :

```bash
npm run deploy
```
