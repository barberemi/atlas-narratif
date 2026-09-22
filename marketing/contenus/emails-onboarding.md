# Contenus — Séquence email d'onboarding

> But : transformer une inscription en **premier atlas créé**, puis en **habitude**.
> Ton : chaleureux, tutoiement, court. Chaque mail = **un seul objectif, un seul CTA**.
> Envoi via Resend (déjà intégré). À activer en S9 (nov.), une fois le flux d'inscriptions lancé.

---

## Mail 1 — Bienvenue (envoi : immédiat après inscription)

**Objet :** Bienvenue dans Atlas 🗺️ (par où commencer)

> Salut {{PRENOM_USER}},
>
> Content de t'avoir ici ! Atlas Narratif, c'est simple : **tu structures, tu visualises, tu gardes le fil de ta saga.** L'outil ne t'enlève rien de créatif — il te débarrasse de la charge mentale.
>
> Le plus rapide pour comprendre ce que ça donne : jette un œil à la démo, on y a passé *Le Seigneur des Anneaux* en entier.
>
> 👉 **[Explorer la démo]({{DEMO_URL}})**
>
> Et quand tu es prêt à attaquer *ton* histoire :
>
> 👉 **[Créer mon premier projet]({{SITE_URL}})**
>
> Une question, un bug, une idée ? Réponds directement à ce mail, c'est moi qui lis.
>
> À très vite,
> {{PRENOM}}
>
> *L'outil structure. C'est toi qui écris.*

---

## Mail 2 — Ton premier atlas en 10 min (envoi : J+2 si aucun projet créé)

**Objet :** 10 minutes pour voir ton roman en entier

> Salut {{PRENOM_USER}},
>
> Petite relance amicale 🙂 Le vrai déclic avec Atlas, c'est le moment où tu vois **ta** propre histoire apparaître sous tous les angles. Et ça prend moins de 10 minutes :
>
> 1. **Crée un projet** — juste un titre et ta logline (la phrase qui résume ton roman).
> 2. **Choisis ta méthode** — Save the Cat ou le Voyage du Héros. Pose 2-3 beats, même en vrac.
> 3. **Ajoute 3 personnages** — nom, rôle, un mot sur qui ils sont.
>
> C'est tout. Tu as déjà une timeline, un début de carte, un graphe qui prend forme. La sensation « ok, ça tient » commence là.
>
> 👉 **[Je crée mon projet]({{SITE_URL}})**
>
> {{PRENOM}}

---

## Mail 3 — La fonctionnalité qu'on oublie (envoi : J+5 aux utilisateurs actifs)

**Objet :** Tu as essayé la détection d'incohérences ?

> Salut {{PRENOM_USER}},
>
> Tu as commencé à remplir ton atlas — génial 🙌 Il y a une fonctionnalité que les gens découvrent souvent trop tard, et qui change tout sur un projet long :
>
> **La détection d'incohérences + le tracker d'amorces/paiements.**
>
> Plus de 12 détecteurs passent ton histoire au crible : contradictions, doublons, fils laissés en suspens. Et le tracker te rappelle chaque promesse faite au lecteur qui n'a pas encore été payée — même trois tomes plus loin.
>
> C'est exactement le genre de faille qu'un cerveau humain ne peut pas suivre sur 300 pages. Va y jeter un œil sur ton projet :
>
> 👉 **[Voir mes incohérences]({{SITE_URL}}/incoherences)**
>
> Et dis-moi ce que tu en penses — tes retours orientent vraiment la suite.
>
> {{PRENOM}}
>
> PS : si Atlas t'est utile, le partager à un pote qui écrit, c'est le plus beau des coups de pouce 🙏

---

## Notes d'implémentation

- Placeholders spécifiques emails : `{{PRENOM_USER}}` = prénom de l'inscrit (à mapper depuis Better Auth).
- Déclencheurs conditionnels (mail 2 « si aucun projet », mail 3 « si actif ») → logique simple côté serveur ou outil d'emailing.
- Garder les emails **texte d'abord**, très peu de HTML : ça passe mieux en délivrabilité et colle au ton « c'est moi qui t'écris ».
- Un lien de désinscription clair (obligation légale + confiance).
