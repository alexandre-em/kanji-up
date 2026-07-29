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
- **Je ne commite jamais sans confirmation.** Le plan validé à l'étape 5 vaut confirmation pour
  les commits qui y sont décrits ; tout commit hors plan se redemande.
- Push seulement sur demande explicite.
- Screenshots de l'émulateur **dès qu'un changement est visible** (`SendUserFile`).
- Je vérifie avant de dire que c'est fait : `npx eslint <fichiers touchés>`, `npx tsc --noEmit`
  (comparé à la baseline, cf. §4), et un passage réel dans l'app.

### Voie rapide (exception)
Pour un changement **purement cosmétique ou un correctif trivial** — une couleur, un espacement,
une faute de frappe, un libellé, une ligne évidente — je saute les étapes 2 à 5 : j'implémente
directement et je montre le résultat (screenshot si c'est visible).

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
  un hex en dur — sauf le blanc sur fond de marque.
- Icônes : PNG déjà chargés via `Assets.icons.*` (aucune lib d'icônes vectorielles) ; sinon
  `react-native-svg` dans `src/components/svg/`.
- i18n : **clés plates** (`"home.menu.selection.title"`), à ajouter dans `en.json` **et** `fr.json`.
- Espacements : `GENERAL_MARGIN` de `src/constants/styles.ts`, composant `Spacing`.

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
- Routes déclarées sans écran : `Ocr`, `Premium`, et la carte « SETTING » de Home ne navigue pas.
- Le mode sombre est désactivé en dur (`Colors.setScheme('light')` dans `App.tsx`) : la palette
  `dark` de `rnui.ts` est du code mort.
- Sur l'émulateur, l'API renvoie des 500 (`Error getting user`) → toasts LogBox parasites.

---

## 5. Décisions produit actées

- **Barre d'onglets flottante** (2026-07-30) : 3 onglets vers des écrans réels — Home, Sélection,
  Entraînement. Masquée sur l'onboarding, l'écran d'évaluation (session de dessin plein écran) et
  tous les écrans de détail poussés. Elle se cache au scroll descendant.
  Pas de `@react-navigation/bottom-tabs` : la barre pilote le stack existant via le container ref.
  Compromis accepté : pas d'état conservé par onglet, le retour Android suit l'historique du stack.
