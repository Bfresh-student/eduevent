# ÉduEvent

ÉduEvent est une interface web dédiée à la découverte et à la réservation d’événements universitaires : conférences, ateliers, webinaires, activités sportives et rencontres sur le campus.

Le projet est construit en HTML, CSS et JavaScript natifs. Il ne nécessite pas de framework ni de serveur pour être consulté localement.

## Fonctionnalités

- Page d’accueil avec hero, événements mis en avant et newsletter.
- Catalogue d’événements avec recherche, filtres et plusieurs modes d’affichage.
- Page de détail avec informations pratiques, réservation et commentaires.
- Création de compte, connexion et espace Profil étudiant.
- Réservations conservées dans le navigateur via le stockage local.
- Page À propos avec équipe, FAQ et formulaire de contact.
- Interface responsive pour mobile, tablette et ordinateur.

## Pages

| Page | Fichier | Rôle |
| --- | --- | --- |
| Accueil | `index.html` | Présentation de la plateforme et événements en vedette. |
| Événements | `evenements.html` | Recherche et filtrage du catalogue. |
| Détail | `detail.html` | Informations complètes et réservation d’un événement. |
| Profil | `profil.html` | Authentification, informations étudiant et réservations. |
| À propos | `a-propos.html` | Présentation du projet, FAQ et contact. |

## Démarrage

1. Clonez ou téléchargez le projet.
2. Ouvrez le dossier dans votre éditeur.
3. Lancez `index.html` dans un navigateur.

Pour une navigation locale plus fiable, notamment lorsque les données JSON sont chargées, utilisez une extension de serveur local telle que **Live Server** dans Visual Studio Code.

## Vérification du code

Installez les dépendances si nécessaire :

```bash
npm install
```

Puis lancez ESLint sur les scripts :

```bash
npx eslint js
```

## Structure du projet

```text
eduevent/
├── index.html              # Accueil
├── evenements.html         # Catalogue d’événements
├── detail.html             # Détail d’un événement
├── profil.html             # Compte et espace étudiant
├── a-propos.html           # Présentation et contact
├── css/
│   ├── style.css           # Styles principaux
│   ├── responsive.css      # Adaptations aux écrans
│   └── animations.css      # Animations et préférences d’accessibilité
├── js/
│   ├── main.js             # Utilitaires et interactions communes
│   ├── evenements.js       # Recherche et filtres
│   ├── detail.js           # Réservation et détail
│   └── profil.js           # Authentification et profil
├── data/
│   └── evenements.json     # Données des événements
└── images/                 # Logos et visuels
```

## Stockage des données

Dans cette version, les comptes et réservations sont simulés dans le stockage local du navigateur. Les données sont donc propres à chaque navigateur et appareil ; elles ne sont pas synchronisées avec un serveur.

## Technologies

- HTML5
- CSS3
- JavaScript moderne
- JSON pour les données d’événements
- ESLint pour le contrôle statique des scripts

## Accessibilité et responsive

Le site comprend une navigation mobile, un lien d’accès rapide au contenu, des états de focus visibles, une prise en charge de la préférence de réduction des animations et des composants redimensionnés pour les petits écrans.

## Évolutions possibles

- Ajouter une API et une base de données pour les comptes et réservations.
- Ajouter un espace d’administration pour publier les événements.
- Mettre en place l’envoi réel des formulaires de contact et newsletter.
- Ajouter des tests automatisés des parcours de réservation.