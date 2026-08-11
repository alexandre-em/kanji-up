# KanjiUp mobile — cadre de travail

Ce fichier est chargé automatiquement à chaque session Claude Code dans `front/mobile`.
Il définit **comment** on travaille sur ce projet. Il est vivant : on l'enrichit au fil des features.

---

## 1. Le flow de développement

Pour chaque demande, dans cet ordre. **On ne saute pas d'étape.**

### Étape 1 — Alexandre expose le contexte
Le besoin, le contexte produit, les contraintes. Pas forcément la solution.

### Étape 2 — Je challenge le produit
**Avant** de parler technique. Je me mets dans la peau d'un utilisateur **peu à l'aise avec la
technologie et les applis mobiles**, et je cherche activement les failles d'usage. Ce n'est pas une
formalité : je dois sortir des problèmes concrets, pas des généralités.

Grille de lecture (voir §2 pour le détail) : découvrabilité, charge cognitive, réversibilité,
états vides / erreurs / lenteur, accessibilité physique (pouce, taille des cibles, vue).

Je remonte : ce qui coince, pourquoi, et une piste de solution pour chaque point.

### Étape 3 — On clarifie
Je pose mes questions ouvertes (`AskUserQuestion` quand plusieurs directions sont possibles).
On ne passe à la suite que quand c'est clair **des deux côtés**.

### Étape 4 — Plan d'implémentation
Concis. Ce que je vais faire, **et pourquoi ces choix** (alternatives écartées incluses quand le
choix n'est pas évident). Le plan contient déjà **le découpage en commits atomiques**.

### Étape 5 — Validation
J'attends la confirmation explicite d'Alexandre. Aucun code écrit avant.

### Étape 6 — Implémentation + commits atomiques
- Un commit = **un** changement logique cohérent, qui compile et se tient tout seul.
- Découpage typique : prérequis technique → logique/données → UI → branchement → i18n/finitions.
- **Je ne commite jamais sans confirmation, et je la demande commit par commit.** Valider le plan
  ne vaut pas blanc-seing : j'implémente un lot, je le montre, j'attends le feu vert, je commite,
  je passe au suivant.
- Push seulement sur demande explicite.
- **Screenshots seulement sur demande explicite d'Alexandre** — pas automatique après chaque
  changement visible, que ce soit pour lui envoyer (`SendUserFile`) **ou pour ma propre
  vérification**. Chaque capture lue (même juste par moi, sans l'envoyer) consomme autant qu'un
  envoi — ce n'est pas le `SendUserFile` qui coûte, c'est la lecture d'image elle-même. Par
  défaut, je décris le résultat en texte à partir de ce que je peux vérifier sans image : lint,
  types, logs, code review.
- Je vérifie avant de dire que c'est fait : `npx eslint <fichiers touchés>` et `npx tsc --noEmit`
  (comparé à la baseline, cf. §4). Un passage réel dans l'app avec capture d'écran est réservé aux
  cas où c'est le seul moyen de vérifier (nouveau pattern jamais prouvé en live, rendu visuel
  ambigu) — et même là, **une seule capture** pour se faire une idée, pas une série pour
  "attraper le bon moment" (ex. un splash screen transitoire) : si la première capture ne suffit
  pas à conclure, je le dis et je passe à autre chose plutôt que de réessayer en boucle.
  Si le pattern (couleur/style/structure) a déjà été vérifié en live ailleurs dans la même
  session, la revue de code suffit, pas besoin de re-capturer.
  Pour une interaction qui échoue (tap qui n'aboutit pas, dialog bloqué) : **deux tentatives max**
  avant d'arrêter et de continuer sur la base de la revue de code.

### Voie rapide (exception)
Pour un changement **purement cosmétique ou un correctif trivial** — une couleur, un espacement,
une faute de frappe, un libellé, une ligne évidente — je saute les étapes 2 à 5 : j'implémente
directement et je décris le résultat (screenshot seulement si demandé, cf. §1 étape 6).

La voie rapide ne s'applique **pas** dès qu'il y a : un nouvel écran ou composant, un changement de
navigation, de la logique métier ou d'état, un impact sur un parcours utilisateur, une nouvelle
dépendance, ou un doute sur le besoin. En cas d'hésitation → flow complet.
Les commits restent soumis à confirmation, voie rapide incluse.

---

## 2. Grille de challenge produit

À dérouler à l'étape 2. L'utilisateur cible n'est pas développeur : il ne devine pas, ne lit pas la
doc, et abandonne si c'est confus.

- **Découvrabilité** — comment il trouve la fonctionnalité sans qu'on lui explique ? Une icône
  seule est rarement comprise ; un libellé explicite l'est.
- **Charge cognitive** — combien de décisions avant d'obtenir un résultat ? Peut-on en supprimer ?
- **Réversibilité** — peut-il annuler, revenir, se tromper sans conséquence ? Où est le retour ?
- **États non nominaux** — vide (0 kanji sélectionné), chargement lent, hors ligne, erreur API.
  Chacun doit dire ce qui se passe **et** quoi faire ensuite.
- **Feedback** — après un tap, sait-il que ça a marché ? (toast, transition, état visuel)
- **Vocabulaire** — le terme est-il compris par un débutant en japonais ? (« JLPT », « radical »,
  « on/kun » ne parlent pas à tout le monde)
- **Accessibilité physique** — cibles ≥ 44dp, zone atteignable au pouce, contraste suffisant,
  texte qui supporte une police système agrandie.
- **Premier lancement** — que voit quelqu'un qui n'a rien configuré, aucun kanji sélectionné ?

---

## 3. Repères techniques

**Stack** : React Native 0.80 bare (pas d'Expo), TypeScript strict, React Navigation v7
(native-stack uniquement), Redux Toolkit, `react-native-ui-lib` (RNUI) v7 comme design system,
Reanimated 4, i18next. **Android uniquement pour l'instant : il n'y a pas de dossier `ios/`.**

**Fichiers structurants**
- `src/screens/router.tsx` — navigation, un seul stack à plat + la barre d'onglets flottante
- `src/components/layout.tsx` — wrapper de scroll commun à tous les écrans (titre/sous-titre i18n,
  dégagement sous la barre, pilotage du masquage au scroll)
- `src/components/bottomNavBar.tsx` + `src/constants/tabs.tsx` — barre d'onglets et sa config
- `src/providers/` — `tabBar` (shared value Reanimated), `toaster`, `user`
- `src/config/rnui.ts` — **source de vérité du thème** : palette, typos, icônes PNG

**Conventions**
- Couleurs : toujours les tokens RNUI (`Colors.$backgroundPrimaryHeavy`, `$textDefault`…), jamais
  un hex en dur — sauf le blanc sur fond de marque. **Seule autre exception : le composant
  `Canvas`** (`src/components/canvas.tsx`) — fond blanc et trait noir **toujours** en dur, quel que
  soit le thème. Ce n'est pas un oubli : l'image du canvas est envoyée telle quelle au modèle de
  reconnaissance, qui n'a été entraîné que sur ce pattern (fond blanc, trait noir). Le faire suivre
  le thème casserait la reconnaissance en mode sombre.
- Icônes : PNG déjà chargés via `Assets.icons.*` (aucune lib d'icônes vectorielles) ; sinon
  `react-native-svg` dans `src/components/svg/`.
- i18n : **clés plates** (`"home.menu.selection.title"`), à ajouter dans `en.json` **et** `fr.json`.
- Espacements : `GENERAL_MARGIN` de `src/constants/styles.ts`, composant `Spacing`.
- Découpage fichiers : **un fichier = une seule entité de haut niveau** — une page, un composant,
  un hook, ou un groupe de fonctions utilitaires. Jamais de mélange entre catégories différentes
  (hook + composant, page + sous-composant, fonction utilitaire + hook) dans le même fichier, même
  si elles sont liées ou n'ont qu'un seul appelant. En revanche, **grouper est légitime à l'intérieur
  d'une même catégorie** tant que tout le contenu sert ce que le nom du fichier annonce : plusieurs
  fonctions outils dans un fichier utilitaire nommé pour ce qu'elles font ensemble (ex.
  `progression.ts` regroupant `getAccuracyPercent`, `isKanjiMastered`, `hasNewlyMasteredKanji`…),
  ou un hook qui s'appuie sur plusieurs fonctions internes non exportées tant qu'elles ne servent
  qu'à ce hook (ex. `useResultStyles.ts` qui a son propre helper interne de calcul). Nom du fichier
  = nom de l'entité principale qu'il expose (ex. `kanjiResultCard.tsx` pour le composant carte,
  `useResultStyles.ts` pour le hook de styles) — jamais de fichier fourre-tout type
  `helpers.ts`/`utils.ts` sans rapport de nom avec son contenu. Un composant ne cohabite jamais avec
  un hook qu'il utilise, une page ne cohabite jamais avec ses sous-composants.

**Émulateur / screenshots** (SDK dans `~/Library/Android/sdk`, AVD `Pixel_7_Pro_API_34`)
```sh
~/Library/Android/sdk/emulator/emulator -avd Pixel_7_Pro_API_34   # boot
npx react-native start                                            # Metro
npx react-native run-android --no-packager                        # build (~20 min à froid)
~/Library/Android/sdk/platform-tools/adb exec-out screencap -p > s.png
```

---

## 4. État connu du repo (dette préexistante, pas des régressions)

À vérifier par comparaison avant d'accuser un changement récent :
- `npx tsc --noEmit` → **18 erreurs de baseline** (typage `navigate(string)`, `Stack.Screen`,
  `react-native-ui-lib/config` sans types…).
- `npm run lint` → 3 erreurs préexistantes (`kanjiList/index.tsx`, `kanjiList/kanji/index.tsx`,
  `services/index.ts`) + des warnings.
- `fr.json` ne contient que les clés d'onboarding, avec des valeurs **en anglais** ; le reste
  retombe sur `en` via `fallbackLng`.
- La carte « SETTING » de Home ne navigue pas.
- ~~`Ocr`/`Premium` étaient documentées ici comme routes sans écran~~ — **faux, corrigé le
  2026-08-10** : les deux sont pleinement implémentées et branchées dans `router.tsx`. `Premium`
  (`src/screens/premium/index.tsx`) a un vrai flow d'achat via `react-native-iap` (abonnements
  mensuel/annuel + lifetime), vérifié côté serveur (`/billing/verify-purchase`). `Ocr`
  (`src/screens/ocr/index.tsx`) utilise réellement la caméra/galerie (`react-native-image-picker`)
  et upload l'image au backend (`scanService.create`, `/scans`).
- Le mode sombre est désactivé en dur (`Colors.setScheme('light')` dans `App.tsx`) : la palette
  `dark` de `rnui.ts` est du code mort. Aperçu réel fait le 2026-07-31 (bascule temporaire de
  `setScheme`) : les tokens de `rnui.ts` s'appliquent correctement, mais plusieurs écrans ont des
  bugs d'affichage jamais vus puisque jamais testés — sur Home, le texte « Welcome back » / « X
  kanji selected » est quasi invisible (texte sombre sur fond sombre), et les `Card.Section` de
  SELECT/SCAN/WIN CREDITS gardent un fond blanc plein derrière leur titre. Cause probable : usage
  de tokens RNUI jamais définis dans notre thème (`$backgroundElevated`, `$backgroundElevatedLight`,
  `$backgroundInverted`, `$textNeutralHeavy` — voir aussi la nouvelle famille `$*Neutral*` ajoutée
  pour remplacer ces fallbacks non contrôlés). Activer le mode sombre pour de vrai est un chantier
  à part, non demandé pour l'instant.
- Sur l'émulateur, l'API renvoie des 500 (`Error getting user`) → toasts LogBox parasites.
- **Backend** : `searchCharacter` (`back/kanjiup/src/services/kanji.ts:64`) ne sélectionne pas
  `jlpt` dans le `populate` du sous-document `kanji`, contrairement à `getAll` (ligne 38) qui
  l'inclut. Conséquence côté mobile : le tag JLPT des résultats de recherche kanji
  (`src/screens/search/difficultyTag.tsx`, `getJlptTag`) serait toujours vide contre la vraie API
  — volontairement pas appelé depuis `kanjiResultCard.tsx` en attendant ce fix backend.
- **Certaines interactions font planter l'app sur l'AVD `Pixel_7_Pro_API_34`**, de façon pas
  totalement prévisible — `NullPointerException: onBatchComplete() on a null object reference` +
  `ReactHost.getOrCreateDestroyTask()`. Isolé le 2026-07-31 en construisant la page Search :
  - Taper un caractère dans un champ de texte plante systématiquement — reproduit à l'identique
    avec `adb shell input text`, `adb shell input keyevent` touche par touche, un `SearchInput`
    RNUI *et* un `TextInput` RN totalement vanilla sans personnalisation. Précédé d'un cycle
    d'échec d'affichage du clavier (`ImeTracker ... onFailed at PHASE_CLIENT_VIEW_SERVED`).
  - Le simple tap sur un `SegmentedControl` (RNUI), sans aucun clavier impliqué, plante aussi avec
    la même signature.
  - À l'inverse : navigation entre écrans, tap sur un bouton simple, et la barre d'onglets flottante
    maison (`bottomNavBar.tsx`, animée en Reanimated) sont stables et ont été tapés à répétition
    tout au long de cette session sans jamais planter.
  Le dénominateur commun n'est pas clair (pas juste « IME », pas juste « RNUI ») — pointe vers une
  fragilité générale de cet émulateur/build face à certaines interactions plutôt qu'un bug de code
  précis. **Non résolu** : à retester sur un appareil physique ou un autre AVD. En attendant,
  toute interaction au-delà d'un tap de navigation simple reste **non vérifiable en live** sur cet
  émulateur pour un composant nouvellement ajouté — vérifier ce qui est vérifiable (rendu initial,
  navigation, lint, types, relecture de code) et laisser le test interactif réel à un appareil.

---

## 5. Décisions produit actées

- **Barre d'onglets flottante** (2026-07-30) : 4 onglets vers des écrans réels — Home, Sélection,
  Entraînement, Réglages (ajouté le 2026-08-01). Masquée sur l'onboarding, l'écran d'évaluation
  (session de dessin plein écran) et tous les écrans de détail poussés. Elle se cache au scroll
  descendant. Pas de `@react-navigation/bottom-tabs` : la barre pilote le stack existant via le
  container ref. Compromis accepté : pas d'état conservé par onglet, le retour Android suit
  l'historique du stack.
