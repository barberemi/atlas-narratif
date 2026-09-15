// Registre des articles de blog (contenu first-party).
// Règles éditoriales : ai/marketing/blog-guidelines.md
// Chaque article : métadonnées SEO + corps HTML (rendu via .prose-atlas).

const threeActsDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 250" role="img" aria-label="Schéma de la structure en trois actes et de la montée de la tension" style="width:100%;height:auto">
    <!-- courbe de tension -->
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="0,112 120,98 180,86 300,70 360,58 480,76 540,90 600,44 632,26 720,70"/>
    <!-- bandes d'actes -->
    <g>
      <rect x="0"   y="132" width="176" height="54" rx="8" fill="#5cae8e" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.14"/>
      <rect x="184" y="132" width="352" height="54" rx="8" fill="#cba15e" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.14"/>
      <rect x="544" y="132" width="176" height="54" rx="8" fill="#5cae8e" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.14"/>
    </g>
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="15" text-anchor="middle">
      <text x="88"  y="162">Acte 1</text>
      <text x="360" y="162">Acte 2</text>
      <text x="632" y="162">Acte 3</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" fill="#a9a291" font-size="11" text-anchor="middle">
      <text x="88"  y="178">≈ 25 %</text>
      <text x="360" y="178">≈ 50 %</text>
      <text x="632" y="178">≈ 25 %</text>
    </g>
    <!-- repères -->
    <g>
      <circle cx="180" cy="86" r="4" fill="#cba15e"/>
      <circle cx="360" cy="58" r="4" fill="#cba15e"/>
      <circle cx="632" cy="26" r="4" fill="#cba15e"/>
    </g>
    <g font-family="'Spectral',Georgia,serif" fill="#a9a291" font-size="12.5" text-anchor="middle">
      <text x="180" y="222">Déclencheur</text>
      <text x="360" y="222">Midpoint</text>
      <text x="632" y="222">Climax</text>
    </g>
    <g stroke="#ffffff" stroke-opacity="0.14">
      <line x1="180" y1="90" x2="180" y2="132"/>
      <line x1="360" y1="62" x2="360" y2="132"/>
      <line x1="632" y1="30" x2="632" y2="132"/>
    </g>
  </svg>
  <figcaption>La structure en trois actes : proportions et montée de la tension. La courbe verte figure l'intensité dramatique.</figcaption>
</figure>`;

const commentStructurerUnRoman = {
  slug: 'comment-structurer-un-roman',
  pillar: 'P1',
  metaTitle: 'Comment structurer un roman : le guide complet',
  title: 'Comment structurer un roman : le guide complet',
  description:
    'Structure en 3 actes, Save the Cat, Voyage du Héros : le guide complet pour structurer ton roman (ou ta saga) sans étouffer ta créativité.',
  excerpt:
    'Trois actes, 15 beats, 12 étapes : les méthodes qui donnent une colonne vertébrale à ton histoire, sans brider ta plume.',
  date: '2026-09-10',
  readingTime: '9 min',
  tags: ['Structure', 'Méthode', 'Save the Cat', 'Voyage du Héros'],
  emoji: '🧭',
  html: `
<p>Tu as une idée qui te tient éveillé la nuit, des personnages plein la tête, peut-être même déjà 30 000 mots posés sur la page. Et pourtant, cette petite voix&#8239;: <em>est-ce que ça tient&#8239;? est-ce que ça va quelque part&#8239;?</em></p>
<p>Structurer un roman, ce n'est pas enfermer ton histoire dans une case. C'est lui donner une colonne vertébrale, celle qui fait qu'un lecteur reste debout à 2h du matin pour connaître la suite. Voici comment t'y prendre, méthode par méthode, sans jargon inutile.</p>

<h2>🧭 Pourquoi structurer (et pourquoi ça ne tue pas la créativité)</h2>
<p>Le débat revient toujours&#8239;: <em>structurer, est-ce que ça ne bride pas l'inspiration&#8239;?</em></p>
<p>C'est un faux débat. Une structure narrative n'est pas un moule, c'est une <strong>charpente</strong>. Personne ne reproche à une cathédrale d'avoir des fondations&#8239;; ce sont elles qui lui permettent de monter haut. Ta structure, c'est pareil&#8239;: elle porte les moments de grâce, elle ne les remplace pas.</p>
<p>Concrètement, structurer te sert à trois choses&#8239;:</p>
<ul>
  <li><strong>Ne plus écrire dans le brouillard.</strong> Tu sais où tu vas, donc tu n'abandonnes pas au chapitre 12 parce que «&#8239;ça part dans tous les sens&#8239;».</li>
  <li><strong>Doser la tension.</strong> Une bonne structure place les révélations, les retournements et les respirations au bon endroit, pas trois coups d'éclat d'affilée puis quarante pages plates.</li>
  <li><strong>Tenir la cohérence.</strong> Surtout si tu écris une saga&#8239;: savoir ce qui a été promis, et où ça doit être payé.</li>
</ul>
<p>Les plus grandes histoires suivent une structure. Les auteurs qui «&#8239;écrivent à l'instinct&#8239;» ont souvent simplement intériorisé ces schémas à force de lire. Autant les connaître.</p>

<h2>🏛️ Les trois grandes structures à connaître</h2>
<h3>1. La structure en trois actes</h3>
<p>C'est le squelette de base, hérité du théâtre. Tout le reste en dérive.</p>
${threeActsDiagram}
<ul>
  <li><strong>Acte 1, la mise en place (≈ 25&#8239;%)</strong>&#8239;: on découvre le monde, le héros, son quotidien. Puis un <strong>élément déclencheur</strong> vient tout bousculer et le lance dans l'aventure.</li>
  <li><strong>Acte 2, la confrontation (≈ 50&#8239;%)</strong>&#8239;: le héros affronte des obstacles croissants. Au milieu, un <strong>point de bascule</strong> (le <em>midpoint</em>) change la donne. La tension monte jusqu'au pire moment.</li>
  <li><strong>Acte 3, la résolution (≈ 25&#8239;%)</strong>&#8239;: climax, dénouement, nouveau monde. Le héros a changé.</li>
</ul>
<p>Simple, universelle, elle marche pour tout. Mais elle reste large&#8239;: c'est une carte à petite échelle. Pour les détails, on passe à des méthodes plus fines.</p>

<h3>2. Save the Cat&#8239;: les 15 beats</h3>
<p>Créée par le scénariste Blake Snyder, cette méthode découpe l'histoire en <strong>15 temps forts</strong> («&#8239;beats&#8239;») ultra-précis. Redoutable pour cadencer une intrigue.</p>
<ol>
  <li><strong>Image d'ouverture</strong>, le ton, le monde en une scène.</li>
  <li><strong>Thème énoncé</strong>, la question morale du récit, glissée l'air de rien.</li>
  <li><strong>Mise en place</strong>, le quotidien du héros et ses failles.</li>
  <li><strong>Catalyseur</strong>, l'événement qui casse la routine.</li>
  <li><strong>Débat</strong>, le héros hésite&#8239;: y aller ou non&#8239;?</li>
  <li><strong>Passage dans le deuxième acte</strong>, il choisit, il plonge.</li>
  <li><strong>Intrigue secondaire (B-story)</strong>, souvent la relation, l'amour, le mentor.</li>
  <li><strong>Fun and games</strong>, la «&#8239;promesse du pitch&#8239;», le cœur de ce qu'on est venu voir.</li>
  <li><strong>Midpoint</strong>, fausse victoire ou fausse défaite qui rebat les cartes.</li>
  <li><strong>Les méchants se rapprochent</strong>, la pression monte, tout se resserre.</li>
  <li><strong>Tout est perdu</strong>, le point le plus bas.</li>
  <li><strong>La nuit noire de l'âme</strong>, le héros touche le fond, puis comprend.</li>
  <li><strong>Passage dans le troisième acte</strong>, la solution émerge, souvent grâce à la B-story.</li>
  <li><strong>Finale</strong>, il applique ce qu'il a appris et l'emporte.</li>
  <li><strong>Image finale</strong>, le miroir de l'ouverture&#8239;: mesure du chemin parcouru.</li>
</ol>
<p><strong>Pour quel genre&#8239;?</strong> Les récits à intrigue forte et rythme soutenu&#8239;: thrillers, comédies, romances, drames, et plus largement le cinéma grand public. <em>Le Roi Lion</em> colle presque parfaitement à ces 15 beats.</p>
<p>Poser ces beats dans un outil comme <strong>Atlas Narratif</strong> t'aide à voir d'un coup d'œil quels temps forts sont solides et lesquels sonnent creux&#8239;: le <em>midpoint</em> mou, par exemple, saute aux yeux.</p>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif : les 15 beats placés sur les chapitres, répartis sur les trois actes, avec leur position idéale." loading="lazy" />
  <figcaption>Les 15 beats de Save the Cat visualisés dans Atlas Narratif (démo&#8239;: Le Seigneur des Anneaux).</figcaption>
</figure>

<h3>3. Le Voyage du Héros&#8239;: les 12 étapes</h3>
<p>Formalisé à partir des travaux de Joseph Campbell, c'est le schéma mythologique par excellence&#8239;: la trame de <em>Star Wars</em>, du <em>Seigneur des Anneaux</em>, de <em>Harry Potter</em>.</p>
<ol>
  <li><strong>Le monde ordinaire</strong>, la vie d'avant.</li>
  <li><strong>L'appel à l'aventure</strong>, une mission, une brèche.</li>
  <li><strong>Le refus de l'appel</strong>, la peur, l'hésitation.</li>
  <li><strong>La rencontre du mentor</strong>, Gandalf, Dumbledore, Obi-Wan.</li>
  <li><strong>Le passage du seuil</strong>, on quitte le monde connu.</li>
  <li><strong>Épreuves, alliés, ennemis</strong>, l'apprentissage du nouveau monde.</li>
  <li><strong>L'approche de la caverne</strong>, on prépare le grand danger.</li>
  <li><strong>L'épreuve suprême</strong>, le face-à-face avec la mort (réelle ou symbolique).</li>
  <li><strong>La récompense</strong>, l'objet, le savoir, la victoire arrachée.</li>
  <li><strong>Le chemin du retour</strong>, les conséquences rattrapent le héros.</li>
  <li><strong>La résurrection</strong>, l'épreuve finale, la transformation définitive.</li>
  <li><strong>Le retour avec l'élixir</strong>, il revient changé, porteur d'un don pour les siens.</li>
</ol>
<p><strong>Pour quel genre&#8239;?</strong> La fantasy, la SF, les récits d'initiation et de quête. Dès qu'un personnage doit <em>grandir</em> en traversant un monde plus grand que lui, le Voyage du Héros brille.</p>
<figure class="blog-figure">
  <img src="/blog/voyage-du-heros.png" alt="La vue Voyage du Héros dans Atlas Narratif : les 12 étapes réparties en trois phases (Départ, Initiation, Retour), chacune reliée à un chapitre." loading="lazy" />
  <figcaption>Les 12 étapes du Voyage du Héros appliquées à l'arc d'Aragorn (démo LOTR).</figcaption>
</figure>

<h2>🧩 Comment choisir ta méthode</h2>
<p>Pas besoin de te marier avec une seule. Repère plutôt ce que sert ton histoire&#8239;:</p>
<ul>
  <li><strong>Ton projet est une quête, une initiation, une transformation intérieure&#8239;?</strong> → Voyage du Héros.</li>
  <li><strong>Ton projet mise sur le rythme, les retournements, une mécanique d'intrigue serrée&#8239;?</strong> → Save the Cat.</li>
  <li><strong>Tu veux juste un cadre souple pour dégrossir&#8239;?</strong> → Trois actes.</li>
</ul>
<p>Astuce de pro&#8239;: beaucoup d'auteurs <strong>combinent</strong>. On cadre les grandes masses en trois actes, on affine le tempo avec les 15 beats, et on vérifie l'évolution du héros avec le Voyage. Les méthodes ne se contredisent pas, elles se regardent sous des angles différents.</p>

<h2>🗺️ Structurer une saga&#8239;: le niveau au-dessus</h2>
<p>Écrire <em>une</em> histoire est difficile. Écrire <em>une série</em> de trois, cinq, sept tomes qui tiennent ensemble, c'est un autre métier. C'est là que la plupart des projets s'effondrent, souvent au tome 2.</p>
<p>Deux notions deviennent vitales&#8239;:</p>
<ul>
  <li><strong>Les amorces et les paiements (plant &amp; payoff).</strong> Une amorce, c'est une promesse&#8239;: l'épée rouillée du chapitre 3, la phrase énigmatique du mentor, la cicatrice inexpliquée. Le paiement, c'est le moment où cette promesse est tenue, parfois <strong>deux tomes plus loin</strong>. Rowling est une maîtresse du genre&#8239;: des détails semés au tome 1 explosent au tome 7. Chaque amorce doit trouver son paiement, sinon le lecteur se sent floué.</li>
  <li><strong>La cohérence de continuité.</strong> Sur 300 000 mots et cinq ans d'écriture, les erreurs se glissent&#8239;: un personnage aux yeux bleus au tome 1 et verts au tome 3, un événement impossible dans ta chronologie, un lieu qui déménage. Ce sont ces détails qui brisent l'immersion.</li>
</ul>
<p>Tenir tout ça de tête est impossible. C'est précisément pour les sagas qu'un <strong>atlas de ton histoire</strong> prend son sens&#8239;: une carte, une timeline, un suivi des amorces d'un tome à l'autre. Atlas Narratif a été pensé pour les séries&#8239;: il relie tes promesses à leurs paiements sur toute la saga et repère automatiquement les incohérences avant tes lecteurs (plus de 12 détecteurs y veillent).</p>
<figure class="blog-figure">
  <img src="/blog/amorces-paiements.png" alt="Le suivi des amorces et paiements dans Atlas Narratif : chaque amorce reliée du chapitre où elle est posée au chapitre où elle est résolue, avec son statut." loading="lazy" />
  <figcaption>Le tracker d'amorces et de paiements : chaque promesse suivie de sa mise en place à sa résolution (démo LOTR).</figcaption>
</figure>

<h2>⚠️ Les erreurs classiques à éviter</h2>
<ul>
  <li><strong>Le midpoint mou.</strong> Si le milieu de ton roman est un ventre creux, tout s'affaisse. Ton point de bascule doit <em>changer la donne</em>, pas meubler.</li>
  <li><strong>Le tome 2 qui part en vrille.</strong> Sans objectif clair propre au tome, la suite devient un simple «&#8239;intermède&#8239;» avant le grand final. Chaque tome a besoin de sa propre colonne vertébrale.</li>
  <li><strong>Les amorces jamais résolues.</strong> Tu as promis, tu ne paies pas&#8239;: le lecteur le sent, même s'il ne sait pas nommer sa frustration.</li>
  <li><strong>Le climax non préparé.</strong> Une résolution qui sort de nulle part (le fameux <em>deus ex machina</em>) trahit un manque de structure en amont.</li>
  <li><strong>Confondre chronologie et ordre des chapitres.</strong> L'ordre où tu <em>racontes</em> n'est pas forcément l'ordre où les choses <em>arrivent</em>. Garde les deux en tête, surtout en thriller.</li>
</ul>

<h2>🪜 Méthode pas-à-pas&#8239;: de l'idée au plan</h2>
<p>Voici une marche à suivre concrète pour passer d'une intuition à une structure solide&#8239;:</p>
<ol>
  <li><strong>Formule ta prémisse en une phrase.</strong> «&#8239;Un jeune fermier découvre qu'il a un pouvoir et doit affronter un empire.&#8239;» Si tu ne peux pas la résumer, l'histoire n'est pas encore claire.</li>
  <li><strong>Choisis ta structure</strong> (trois actes, Save the Cat ou Voyage du Héros) selon ton genre.</li>
  <li><strong>Place tes bornes.</strong> Remplis d'abord les points de passage obligés&#8239;: ouverture, catalyseur, midpoint, tout est perdu, climax, image finale. Le reste se logera entre.</li>
  <li><strong>Repère les trous.</strong> Un beat vide n'est pas un problème, c'est une question à te poser&#8239;: <em>qu'est-ce qui manque ici&#8239;?</em></li>
  <li><strong>Sème tes amorces.</strong> Note ce que tu promets et où tu comptes le payer. Pour une saga, fais-le à l'échelle de la série entière.</li>
  <li><strong>Vérifie l'arc de ton héros.</strong> Compare son état à l'ouverture et à l'image finale&#8239;: a-t-il vraiment changé&#8239;?</li>
  <li><strong>Visualise l'ensemble.</strong> Une fois posé, prends de la hauteur&#8239;: timeline, carte, arc émotionnel. C'est en voyant ton histoire <em>en entier</em> que tu repères ce qui cloche.</li>
</ol>

<h2>✅ En résumé</h2>
<p>Structurer un roman, ce n'est pas renoncer à l'inspiration&#8239;: c'est lui donner de quoi tenir debout. Les trois actes te donnent la carte générale, Save the Cat cadence le rythme, le Voyage du Héros suit la transformation. Choisis, combine, et surtout&#8239;: <strong>garde une vue d'ensemble</strong>, d'autant plus si tu écris une saga.</p>
<p>C'est exactement ce que fait <strong>Atlas Narratif</strong>&#8239;: un outil gratuit pour poser ta structure (Save the Cat ou Voyage du Héros, guidés et illustrés), visualiser ta timeline, ta carte et tes personnages, et traquer les incohérences avant tes lecteurs. Tes textes restent les tiens, chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Structure ton premier roman gratuitement avec Atlas Narratif.</a> Et si tu as déjà un manuscrit, importe-le pour en obtenir la carte en quelques minutes.</p>
`,
};

const saveTheCat15Beats = {
  slug: 'la-methode-save-the-cat-15-beats',
  pillar: 'P1',
  metaTitle: 'La méthode Save the Cat : les 15 beats expliqués',
  title: 'La méthode Save the Cat expliquée : les 15 beats',
  description:
    'Les 15 beats de Save the Cat (Blake Snyder) expliqués un par un, avec des exemples concrets, pour cadencer ton roman de l\'ouverture au climax.',
  excerpt:
    'Les 15 temps forts de Blake Snyder, un par un et illustrés par Le Roi Lion : la méthode la plus précise pour rythmer ton intrigue.',
  date: '2026-09-22',
  readingTime: '8 min',
  tags: ['Save the Cat', 'Méthode', 'Beats', 'Structure'],
  emoji: '🎬',
  html: `
<p>Tu as sûrement déjà croisé le nom&#8239;: Save the Cat. C'est aujourd'hui la méthode de structure la plus utilisée à Hollywood, et de plus en plus par les romanciers. Sa force&#8239;? Elle ne se contente pas de dire «&#8239;il faut trois actes&#8239;»&#8239;: elle te donne 15 repères précis, dans l'ordre, pour savoir exactement où placer chaque temps fort.</p>
<p>Dans ce guide, on décortique les 15 beats un par un, avec un exemple que tu connais par cœur&#8239;: Le Roi Lion, qui colle presque parfaitement à la méthode.</p>

<h2>🐱 D'où vient Save the Cat</h2>
<p>La méthode vient du scénariste Blake Snyder, dans son livre Save the Cat! (2005). Le titre fait référence à une astuce de scénario&#8239;: très tôt, montre ton héros faire quelque chose de bien (sauver un chat) pour que le public s'attache à lui.</p>
<p>Snyder a formalisé ce que les meilleures histoires font d'instinct&#8239;: une progression en 15 étapes qui alterne montées de tension et respirations, jusqu'au climax. Ce n'est pas une recette rigide, c'est une <strong>carte de rythme</strong>. Tu restes libre de ton histoire&#8239;; la méthode t'évite juste de te perdre en route.</p>

<h2>🎬 Les 15 beats, un par un</h2>
<p>Les pourcentages indiquent la position approximative dans le récit. À côté de chaque beat, le moment correspondant dans Le Roi Lion.</p>
<ol>
  <li><strong>Image d'ouverture (0-1&#8239;%)</strong>&#8239;: la toute première image donne le ton et le monde. <em>Le Roi Lion&#8239;: le lever du soleil sur la Terre des Lions, la présentation de Simba au Rocher.</em></li>
  <li><strong>Thème énoncé (~5&#8239;%)</strong>&#8239;: quelqu'un formule, l'air de rien, la leçon que le héros devra apprendre. <em>Mufasa&#8239;: «&#8239;Tout ce que la lumière touche est notre royaume&#8239;» et le cycle de la vie.</em></li>
  <li><strong>Mise en place (1-10&#8239;%)</strong>&#8239;: le quotidien du héros, ses failles, ce qui manque à sa vie. <em>Simba, prince insouciant et un peu vaniteux.</em></li>
  <li><strong>Catalyseur (~10&#8239;%)</strong>&#8239;: l'événement qui casse la routine, sans retour possible. <em>La ruée des gnous et la mort de Mufasa.</em></li>
  <li><strong>Débat (10-20&#8239;%)</strong>&#8239;: le héros hésite, a peur, refuse l'aventure. <em>«&#8239;Sauve-toi et ne reviens jamais&#8239;»&#8239;: Simba fuit, écrasé par la culpabilité.</em></li>
  <li><strong>Passage au deuxième acte (~20&#8239;%)</strong>&#8239;: il fait un choix et bascule dans un nouveau monde. <em>Simba quitte le royaume pour la jungle.</em></li>
  <li><strong>Intrigue secondaire / B-story (~22&#8239;%)</strong>&#8239;: une relation qui porte le thème. <em>Timon et Pumbaa (puis Nala) entrent en scène.</em></li>
  <li><strong>Fun and games (20-50&#8239;%)</strong>&#8239;: la «&#8239;promesse du pitch&#8239;», ce pour quoi on est venu. <em>«&#8239;Hakuna Matata&#8239;»&#8239;: la vie insouciante loin des responsabilités.</em></li>
  <li><strong>Point médian / midpoint (~50&#8239;%)</strong>&#8239;: fausse victoire ou fausse défaite qui rebat les cartes. <em>Nala retrouve Simba&#8239;: joie des retrouvailles, mais le royaume est en ruine.</em></li>
  <li><strong>Les méchants se rapprochent (50-75&#8239;%)</strong>&#8239;: la pression monte, les alliés vacillent. <em>Simba refuse de rentrer, se dispute avec Nala, doute de lui.</em></li>
  <li><strong>Tout est perdu (~75&#8239;%)</strong>&#8239;: le point le plus bas, souvent un écho de mort. <em>Simba seul, hanté par la mort de son père.</em></li>
  <li><strong>La nuit noire de l'âme (75-80&#8239;%)</strong>&#8239;: le héros touche le fond, puis entrevoit la vérité. <em>Rafiki et le fantôme de Mufasa&#8239;: «&#8239;Souviens-toi qui tu es.&#8239;»</em></li>
  <li><strong>Passage au troisième acte (~80&#8239;%)</strong>&#8239;: fort de sa leçon, il repart au combat. <em>Simba décide de rentrer affronter Scar.</em></li>
  <li><strong>Finale (80-100&#8239;%)</strong>&#8239;: il applique ce qu'il a appris et l'emporte. <em>Le combat, la vérité sur Scar révélée, Simba reprend sa place.</em></li>
  <li><strong>Image finale (~100&#8239;%)</strong>&#8239;: le miroir de l'ouverture, qui mesure le chemin parcouru. <em>Un nouveau lever du soleil, la présentation du lionceau&#8239;: le cycle recommence.</em></li>
</ol>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif&#8239;: les 15 beats placés sur les chapitres, répartis sur les trois actes, avec leur position idéale." loading="lazy" />
  <figcaption>Les 15 beats posés sur une vraie histoire, chapitre par chapitre (démo&#8239;: Le Seigneur des Anneaux).</figcaption>
</figure>

<h2>🧩 Comment poser tes 15 beats (le beat sheet)</h2>
<p>La méthode s'utilise comme une check-list. Voici l'ordre de travail le plus efficace&#8239;:</p>
<ol>
  <li><strong>Place d'abord les 5 piliers</strong>&#8239;: catalyseur, midpoint, tout est perdu, passage au troisième acte, image finale. Ce sont eux qui tiennent la structure.</li>
  <li><strong>Vérifie les pourcentages</strong>&#8239;: un catalyseur qui arrive à 30&#8239;% du roman, c'est une mise en place trop longue. Le midpoint doit tomber au milieu, pas aux deux tiers.</li>
  <li><strong>Remplis les respirations</strong>&#8239;: fun and games, débat, nuit noire de l'âme. Ce sont elles qui donnent le rythme entre les coups.</li>
  <li><strong>Relie chaque beat à un chapitre</strong>&#8239;: un beat sans scène, c'est un trou dans ta structure, ou une question à te poser.</li>
</ol>
<p>C'est exactement ce que fait la vue Save the Cat d'<strong>Atlas Narratif</strong>&#8239;: tu poses chaque beat sur tes chapitres et tu vois d'un coup d'œil ceux qui sont en place, ceux qui dérivent, et ceux qui manquent.</p>

<h2>⚠️ Les pièges à éviter</h2>
<ul>
  <li><strong>Le midpoint mou.</strong> Si rien ne bascule au milieu, toute la seconde moitié s'affaisse. Le point médian doit changer la donne, pas meubler.</li>
  <li><strong>La mise en place interminable.</strong> Si ton catalyseur n'arrive qu'au chapitre 8, ton lecteur est déjà parti. Vise les 10&#8239;%.</li>
  <li><strong>Le thème oublié.</strong> Le beat «&#8239;thème énoncé&#8239;» n'est pas décoratif&#8239;: c'est la question morale que le finale doit refermer.</li>
  <li><strong>Appliquer les 15 beats à la lettre.</strong> C'est une carte, pas un moule. Certains beats fusionnent, d'autres se déplacent. L'esprit compte plus que le centimètre.</li>
</ul>

<h2>🧭 Save the Cat, trois actes ou Voyage du Héros&#8239;?</h2>
<p>Save the Cat brille sur les récits à intrigue serrée et rythme soutenu&#8239;: thrillers, comédies, romances, drames. Pour un récit d'initiation ou de quête, le Voyage du Héros est souvent plus parlant. Et rien ne t'empêche de combiner les deux. On compare les trois méthodes dans notre guide <a href="/blog/comment-structurer-un-roman">Comment structurer un roman</a>.</p>

<h2>✅ En résumé</h2>
<p>Save the Cat, c'est 15 repères pour ne jamais écrire dans le brouillard&#8239;: tu sais où tu vas, et surtout où placer chaque temps fort. Commence par les 5 piliers, surveille tes pourcentages, et relie chaque beat à une vraie scène.</p>
<p><strong>Atlas Narratif</strong> intègre les 15 beats, guidés et illustrés, et te montre en un coup d'œil si ta structure tient. L'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Pose tes 15 beats gratuitement avec Atlas Narratif.</a> Guidé, illustré, sans clé API.</p>
`,
};

export const posts = [commentStructurerUnRoman, saveTheCat15Beats];

// Articles publiés (hors brouillons) : alimentent l'index /blog, le prerender et le sitemap.
export const getAllPosts = () =>
  posts.filter((p) => !p.draft).sort((a, b) => (a.date < b.date ? 1 : -1));

// Renvoie aussi les brouillons (prévisualisation par URL directe).
export const getPostBySlug = (slug) => posts.find((p) => p.slug === slug) || null;

// Slugs prérendus/sitemap : publiés uniquement (les brouillons ne sont pas mis en ligne).
export const blogSlugs = posts.filter((p) => !p.draft).map((p) => p.slug);
