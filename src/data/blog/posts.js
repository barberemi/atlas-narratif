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

const heroCircleDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 400" role="img" aria-label="Le cercle du Voyage du Héros : douze étapes réparties en trois phases (Départ, Initiation, Retour), le monde ordinaire en haut, le monde extraordinaire en bas." style="width:100%;height:auto">
    <g font-family="ui-monospace,Menlo,monospace" fill="#a9a291" font-size="12" text-anchor="middle">
      <text x="360" y="24">MONDE ORDINAIRE</text>
      <text x="360" y="330">MONDE EXTRAORDINAIRE</text>
    </g>
    <line x1="210" y1="187" x2="510" y2="187" stroke="#ffffff" stroke-opacity="0.16" stroke-dasharray="4 5"/>
    <circle cx="360" cy="187" r="120" fill="none" stroke="#ffffff" stroke-opacity="0.12"/>
    <g font-family="'Spectral',Georgia,serif" fill="#0b1621" font-size="14" font-weight="600" text-anchor="middle">
      <g><circle cx="360" cy="67"  r="14" fill="#cba15e"/><text x="360" y="72">1</text></g>
      <g><circle cx="420" cy="83"  r="14" fill="#cba15e"/><text x="420" y="88">2</text></g>
      <g><circle cx="464" cy="127" r="14" fill="#cba15e"/><text x="464" y="132">3</text></g>
      <g><circle cx="480" cy="187" r="14" fill="#cba15e"/><text x="480" y="192">4</text></g>
      <g><circle cx="464" cy="247" r="14" fill="#cba15e"/><text x="464" y="252">5</text></g>
      <g><circle cx="420" cy="291" r="14" fill="#5cae8e"/><text x="420" y="296">6</text></g>
      <g><circle cx="360" cy="307" r="14" fill="#5cae8e"/><text x="360" y="312">7</text></g>
      <g><circle cx="300" cy="291" r="14" fill="#5cae8e"/><text x="300" y="296">8</text></g>
      <g><circle cx="256" cy="247" r="14" fill="#5cae8e"/><text x="256" y="252">9</text></g>
      <g><circle cx="240" cy="187" r="14" fill="#d9b98a"/><text x="240" y="192">10</text></g>
      <g><circle cx="256" cy="127" r="14" fill="#d9b98a"/><text x="256" y="132">11</text></g>
      <g><circle cx="300" cy="83"  r="14" fill="#d9b98a"/><text x="300" y="88">12</text></g>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="12" text-anchor="middle">
      <g><rect x="120" y="360" width="12" height="12" rx="3" fill="#cba15e"/><text x="176" y="370" fill="#a9a291">Départ (1-5)</text></g>
      <g><rect x="300" y="360" width="12" height="12" rx="3" fill="#5cae8e"/><text x="360" y="370" fill="#a9a291">Initiation (6-9)</text></g>
      <g><rect x="486" y="360" width="12" height="12" rx="3" fill="#d9b98a"/><text x="540" y="370" fill="#a9a291">Retour (10-12)</text></g>
    </g>
  </svg>
  <figcaption>Le cercle du monomythe&#8239;: le héros quitte le monde ordinaire (en haut), traverse l'épreuve dans le monde extraordinaire (en bas), puis revient transformé.</figcaption>
</figure>`;

const voyageDuHeros = {
  slug: 'voyage-du-heros-12-etapes',
  pillar: 'P1',
  metaTitle: 'Le Voyage du Héros : les 12 étapes expliquées',
  title: 'Le Voyage du Héros : les 12 étapes pour structurer ton récit',
  description:
    'Les 12 étapes du Voyage du Héros de Campbell, expliquées et illustrées par Star Wars, Le Seigneur des Anneaux et Harry Potter, pour structurer ton roman.',
  excerpt:
    'Du monde ordinaire au retour avec l\'élixir : les 12 étapes du monomythe, illustrées par les sagas que tu connais, pour bâtir un vrai arc de héros.',
  date: '2026-10-01',
  readingTime: '9 min',
  tags: ['Voyage du Héros', 'Méthode', 'Structure', 'Campbell'],
  emoji: '🗺️',
  html: `
<p>Il y a une raison pour laquelle <em>Star Wars</em>, <em>Le Seigneur des Anneaux</em> et <em>Harry Potter</em> te donnent la même sensation profonde, malgré des univers que tout oppose. Sous l'histoire, il y a la même charpente&#8239;: le Voyage du Héros. Un jeune homme ordinaire quitte son monde, affronte une épreuve qui le dépasse, et revient changé.</p>
<p>Ce schéma n'a rien d'un gadget de scénariste. C'est un motif que l'humanité se raconte depuis les premiers mythes. Voici ses 12 étapes, une par une, et comment t'en servir pour donner à ton récit un arc qui résonne, sans te transformer en photocopieuse de <em>Star Wars</em>.</p>

<h2>🌱 Pourquoi ce schéma parle à tout le monde</h2>
<p>Dans les années 1940, le mythologue Joseph Campbell compare les récits fondateurs de dizaines de cultures. Sa découverte&#8239;: partout, la même trame revient. Il l'appelle le <strong>monomythe</strong>. Des décennies plus tard, le consultant Christopher Vogler le traduit pour Hollywood en un schéma pratique&#8239;: le Voyage du Héros en 12 étapes.</p>
<p>Pourquoi ça marche&#8239;? Parce que ce voyage n'est pas géographique, il est <strong>intérieur</strong>. Franchir un seuil, affronter sa peur, renaître transformé&#8239;: c'est le récit de toute croissance humaine. Ton lecteur ne suit pas seulement un héros qui traverse un monde&#8239;; il revit, en secret, ses propres passages. C'est ça, le carburant de l'émotion.</p>
<p>Une précision utile&#8239;: le Voyage du Héros n'est pas un moule à remplir case par case. C'est une <strong>carte des passages obligés</strong> d'un récit d'initiation. Tu peux en sauter, en fusionner, en réordonner. L'esprit compte plus que la lettre.</p>

<h2>🚪 Les trois grandes phases</h2>
<p>Avant les 12 étapes, retiens les <strong>trois mouvements</strong> qui les regroupent. Si tu ne retiens que ça, tu tiens déjà l'essentiel.</p>
${heroCircleDiagram}
<ul>
  <li><strong>Le Départ.</strong> Le héros quitte son monde ordinaire. C'est l'appel, le refus, la rencontre du mentor, puis le grand saut dans l'inconnu.</li>
  <li><strong>L'Initiation.</strong> Le cœur du récit. Le héros apprend les règles d'un monde plus grand que lui, encaisse, et affronte l'épreuve suprême.</li>
  <li><strong>Le Retour.</strong> Transformé, il rentre. Mais on ne revient jamais indemne&#8239;: il rapporte un savoir, un pouvoir, un remède pour les siens.</li>
</ul>
<p>Remarque la ligne au milieu du cercle&#8239;: elle sépare le <strong>monde ordinaire</strong> (en haut) du <strong>monde extraordinaire</strong> (en bas). Le héros la franchit deux fois&#8239;: à l'aller, quand il plonge dans l'aventure, et au retour, quand il remonte à la surface, différent.</p>

<h2>🧭 Les 12 étapes, une par une</h2>
<p>On déroule chaque étape avec un exemple que tu connais par cœur, Luke Skywalker dans <em>Star Wars, épisode IV</em>, complété par Frodon et Harry quand ils éclairent mieux le propos.</p>

<h3>Phase 1&#8239;: le Départ</h3>
<ol>
  <li><strong>Le monde ordinaire.</strong> On découvre le héros dans sa vie d'avant, avec ce qui lui manque. <em>Luke s'ennuie ferme sur la ferme de son oncle&#8239;; il rêve d'ailleurs. Frodon coule des jours paisibles dans la Comté.</em></li>
  <li><strong>L'appel à l'aventure.</strong> Un événement vient rompre la routine et propose une mission. <em>Le message de la princesse Leia caché dans R2-D2. Pour Frodon, l'Anneau et la menace qui pèse sur lui.</em></li>
  <li><strong>Le refus de l'appel.</strong> Le héros hésite, a peur, invoque de bonnes raisons de rester. Cette résistance le rend humain. <em>Luke&#8239;: «&#8239;Je ne peux pas partir, mon oncle a besoin de moi pour les récoltes.&#8239;»</em></li>
  <li><strong>La rencontre du mentor.</strong> Une figure d'expérience lui donne un savoir, un objet, un cap. <em>Obi-Wan Kenobi et le sabre laser. Gandalf pour Frodon, Dumbledore pour Harry&#8239;: le mentor est partout.</em></li>
  <li><strong>Le passage du seuil.</strong> Le héros s'engage vraiment et quitte le monde connu. Il n'y a plus de retour en arrière. <em>Luke découvre sa famille assassinée&#8239;: plus rien ne le retient, il part pour Alderaan.</em></li>
</ol>

<h3>Phase 2&#8239;: l'Initiation</h3>
<ol start="6">
  <li><strong>Épreuves, alliés et ennemis.</strong> Dans ce monde nouveau, le héros apprend les règles, se fait des alliés, se heurte à des ennemis. <em>La cantina de Mos Eisley, Han Solo et Chewbacca, l'apprentissage de la Force.</em></li>
  <li><strong>L'approche de la caverne.</strong> On se prépare au vrai danger. La tension monte, les plans se dessinent. <em>Le vaisseau est happé par l'Étoile de la Mort&#8239;: le repaire de l'ennemi.</em></li>
  <li><strong>L'épreuve suprême.</strong> Le face-à-face avec la mort, réelle ou symbolique. Le héros touche le fond. <em>Le compacteur d'ordures, la mort d'Obi-Wan sous les yeux de Luke.</em></li>
  <li><strong>La récompense.</strong> Survivant à l'épreuve, il en sort avec un butin&#8239;: un objet, un savoir, une confiance neuve. <em>La princesse est libérée, les plans de l'Étoile sont entre de bonnes mains.</em></li>
</ol>

<h3>Phase 3&#8239;: le Retour</h3>
<ol start="10">
  <li><strong>Le chemin du retour.</strong> Le héros s'engage vers le dénouement, mais les conséquences le rattrapent&#8239;: l'ennemi n'a pas dit son dernier mot. <em>Les chasseurs impériaux prennent en chasse le Faucon&#8239;; la base rebelle est menacée.</em></li>
  <li><strong>La résurrection.</strong> L'épreuve finale, la plus haute. Le héros mobilise tout ce qu'il a appris et renaît une dernière fois. <em>L'assaut sur l'Étoile&#8239;: Luke coupe son ordinateur de visée et se fie à la Force. Il n'est plus le fermier du début.</em></li>
  <li><strong>Le retour avec l'élixir.</strong> Il revient dans son monde, porteur d'un don pour les siens. <em>La médaille, la victoire de la Rébellion. Frodon rentre dans la Comté, à jamais changé par ce qu'il a porté.</em></li>
</ol>

<h2>⚔️ Le vrai sujet&#8239;: la transformation intérieure</h2>
<p>Voici l'erreur la plus commune&#8239;: croire que le Voyage du Héros parle d'action. Les dragons, les batailles, les vaisseaux&#8239;: ce n'est que la surface. Le vrai sujet, c'est <strong>l'arc intérieur</strong>.</p>
<p>À chaque étape extérieure correspond un mouvement intime. L'appel réveille un manque. Le refus révèle une peur. L'épreuve suprême force le héros à abandonner sa vieille identité. La résurrection le fait renaître autre. Le Luke qui tire le missile n'est plus celui qui se plaignait des récoltes.</p>
<p>Pose-toi donc la question qui compte&#8239;: <em>de quoi mon héros a-t-il peur au début, et qu'a-t-il compris à la fin&#8239;?</em> Si tu ne peux pas répondre, ton voyage n'est encore qu'un itinéraire. Compare toujours le point de départ intérieur et le point d'arrivée&#8239;: c'est l'écart entre les deux qui bouleverse le lecteur.</p>

<h2>🗺️ Le Voyage du Héros à l'échelle d'une saga</h2>
<p>Sur un roman unique, les 12 étapes cadrent l'ensemble. Sur une <strong>saga</strong>, ça se joue à deux niveaux à la fois, et c'est là que beaucoup d'auteurs se perdent.</p>
<ul>
  <li><strong>Le grand arc</strong> couvre toute la série&#8239;: Frodon quitte la Comté au début de <em>La Communauté de l'Anneau</em> et revient transformé à la fin du <em>Retour du Roi</em>. Un seul immense Voyage, étalé sur trois tomes.</li>
  <li><strong>Les arcs de tome</strong> rejouent, en miniature, leur propre cycle. Chaque volume a son appel, son épreuve, sa récompense partielle, sinon il devient un simple couloir entre deux moments forts.</li>
</ul>
<p>Autre subtilité de la saga&#8239;: tu peux faire vivre un Voyage à <strong>plusieurs personnages en parallèle</strong>. Dans <em>Le Seigneur des Anneaux</em>, Frodon, Aragorn et Sam suivent chacun leur propre courbe. Les tenir toutes de tête, en s'assurant qu'aucune ne s'affaisse, devient vite impossible sans une vue d'ensemble. C'est exactement ce que la vue <strong>Voyage du Héros</strong> d'Atlas Narratif permet&#8239;: suivre l'arc de chaque personnage, étape par étape, et repérer celui qui piétine.</p>
<figure class="blog-figure">
  <img src="/blog/voyage-du-heros.png" alt="La vue Voyage du Héros dans Atlas Narratif&#8239;: les 12 étapes de l'arc d'Aragorn réparties en trois phases (Départ, Initiation, Retour), chacune reliée à un chapitre." loading="lazy" />
  <figcaption>Les 12 étapes du Voyage du Héros appliquées à l'arc d'Aragorn (démo LOTR).</figcaption>
</figure>

<h2>⚠️ Les erreurs classiques à éviter</h2>
<ul>
  <li><strong>Suivre le schéma à la lettre.</strong> Cocher les 12 cases dans l'ordre produit un récit mécanique et prévisible. Sers-toi de la carte, ne deviens pas son esclave.</li>
  <li><strong>Oublier le refus de l'appel.</strong> Un héros qui fonce sans hésiter n'a pas d'enjeu intérieur. La résistance du début rend la suite crédible.</li>
  <li><strong>Un mentor qui reste trop longtemps.</strong> Si le mentor résout les problèmes à la place du héros, ce dernier ne grandit pas. Le mentor prépare, puis s'efface&#8239;: ce n'est pas un hasard si Obi-Wan meurt aux deux tiers du film.</li>
  <li><strong>Une épreuve suprême sans vrai risque.</strong> Si le héros ne perd rien et ne risque rien, il n'y a pas de renaissance possible. L'épreuve doit lui coûter.</li>
  <li><strong>Un retour bâclé.</strong> Beaucoup de récits s'arrêtent à la victoire et oublient le retour. Or c'est là que le sens se dépose&#8239;: qu'est-ce que le héros rapporte&#8239;?</li>
</ul>

<h2>🪜 Méthode pas-à-pas&#8239;: appliquer le Voyage à ton récit</h2>
<ol>
  <li><strong>Nomme le manque de départ.</strong> Qu'est-ce qui cloche dans la vie ordinaire de ton héros&#8239;? Sa transformation partira de là.</li>
  <li><strong>Définis l'arc intérieur.</strong> Écris en une phrase ce qu'il croit au début et ce qu'il comprendra à la fin. C'est ta boussole.</li>
  <li><strong>Place les quatre bornes.</strong> Appel, passage du seuil, épreuve suprême, retour avec l'élixir. Ce sont les piliers&#8239;; le reste se logera entre.</li>
  <li><strong>Fais du monde extraordinaire un vrai contraste.</strong> Plus il diffère du monde ordinaire, plus le voyage a de relief.</li>
  <li><strong>Vérifie chaque étape par sa fonction, pas par son étiquette.</strong> Peu importe le nom&#8239;: demande-toi ce que la scène fait avancer chez le héros.</li>
  <li><strong>Prends de la hauteur.</strong> Une fois les étapes posées, visualise l'arc en entier pour repérer le ventre mou. C'est en voyant le voyage d'un bloc qu'on sent ce qui manque.</li>
</ol>

<h2>✅ En résumé</h2>
<p>Le Voyage du Héros n'est pas une recette, c'est la carte des grandes transformations. Trois mouvements&#8239;: partir, être mis à l'épreuve, revenir changé. Douze étapes pour baliser le chemin. Et un seul vrai sujet sous la surface&#8239;: l'arc intérieur de ton héros. Sers-t'en comme d'une boussole, jamais comme d'un gabarit.</p>
<p>Pour aller plus loin, compare-le aux autres méthodes dans notre guide <a href="/blog/comment-structurer-un-roman">Comment structurer un roman</a>, ou découvre la mécanique de rythme la plus précise avec <a href="/blog/la-methode-save-the-cat-15-beats">la méthode Save the Cat</a>.</p>
<p><strong>Atlas Narratif</strong> intègre le Voyage du Héros, guidé et illustré par des œuvres connues, pour poser les 12 étapes de chacun de tes personnages et suivre leur transformation d'un tome à l'autre. Tes textes restent les tiens, chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Trace le Voyage de ton héros gratuitement avec Atlas Narratif.</a> Guidé, illustré, pensé pour les sagas.</p>
`,
};

const timelineDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 300" role="img" aria-label="Deux frises comparées : l'ordre du récit (tes chapitres) en haut, l'ordre chronologique des événements en bas, avec un chapitre raconté en flash-back." style="width:100%;height:auto">
    <g font-family="ui-monospace,Menlo,monospace" font-size="12" fill="#a9a291">
      <text x="40" y="44">ORDRE DU RÉCIT (tes chapitres)</text>
      <text x="40" y="214">ORDRE CHRONOLOGIQUE (ce qui s'est passé)</text>
    </g>
    <line x1="60" y1="90" x2="660" y2="90" stroke="#5cae8e" stroke-opacity="0.5" stroke-width="2"/>
    <line x1="60" y1="240" x2="660" y2="240" stroke="#5cae8e" stroke-opacity="0.5" stroke-width="2"/>
    <path d="M420 90 C 300 140, 180 190, 60 240" fill="none" stroke="#cba15e" stroke-width="2" stroke-dasharray="5 5"/>
    <g font-family="'Spectral',Georgia,serif" fill="#0b1621" font-size="13" font-weight="600" text-anchor="middle">
      <g><circle cx="60"  cy="90" r="15" fill="#5cae8e"/><text x="60"  y="95">1</text></g>
      <g><circle cx="180" cy="90" r="15" fill="#5cae8e"/><text x="180" y="95">2</text></g>
      <g><circle cx="300" cy="90" r="15" fill="#5cae8e"/><text x="300" y="95">3</text></g>
      <g><circle cx="420" cy="90" r="15" fill="#cba15e"/><text x="420" y="95">4</text></g>
      <g><circle cx="540" cy="90" r="15" fill="#5cae8e"/><text x="540" y="95">5</text></g>
      <g><circle cx="660" cy="90" r="15" fill="#5cae8e"/><text x="660" y="95">6</text></g>
      <g><circle cx="60"  cy="240" r="15" fill="#cba15e"/><text x="60"  y="245">4</text></g>
      <g><circle cx="180" cy="240" r="15" fill="#5cae8e"/><text x="180" y="245">1</text></g>
      <g><circle cx="300" cy="240" r="15" fill="#5cae8e"/><text x="300" y="245">2</text></g>
      <g><circle cx="420" cy="240" r="15" fill="#5cae8e"/><text x="420" y="245">3</text></g>
      <g><circle cx="540" cy="240" r="15" fill="#5cae8e"/><text x="540" y="245">5</text></g>
      <g><circle cx="660" cy="240" r="15" fill="#5cae8e"/><text x="660" y="245">6</text></g>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11.5" fill="#a9a291">
      <rect x="60" y="276" width="12" height="12" rx="3" fill="#cba15e"/>
      <text x="82" y="286">Le chapitre 4 est un flash-back&#8239;: raconté tard, il s'est passé en premier.</text>
    </g>
  </svg>
  <figcaption>Le même récit, deux lectures&#8239;: l'ordre où tu racontes (en haut) n'est pas l'ordre où les choses arrivent (en bas).</figcaption>
</figure>`;

const creerTimeline = {
  slug: 'creer-une-timeline-roman',
  pillar: 'P1',
  metaTitle: 'Créer une timeline pour ton roman : méthode + outils',
  title: 'Créer une timeline pour ton roman : méthode et outils',
  description:
    'Comment créer une timeline de roman claire : chronologie contre ordre des chapitres, méthode pas-à-pas et outils pour garder le fil de ta saga.',
  excerpt:
    'Chronologie ou ordre des chapitres ? La méthode pour bâtir une timeline qui tient, repérer les trous et garder le fil d\'une saga entière.',
  date: '2026-10-02',
  readingTime: '8 min',
  tags: ['Timeline', 'Chronologie', 'Méthode', 'Saga'],
  emoji: '⏳',
  html: `
<p>Tu écris une scène où ton héros a 17 ans. Trois chapitres plus loin, tu évoques un souvenir «&#8239;d'il y a cinq ans&#8239;»&#8239;: il en avait donc 12. Mais au chapitre 2, tu as écrit qu'à cette époque il vivait déjà seul. Tient-il debout, ce puzzle&#8239;? Sans une timeline, impossible d'en être sûr.</p>
<p>Une frise chronologique, ce n'est pas un luxe de maniaque. C'est l'outil qui t'évite les trous de continuité, les tunnels sans tension et les incohérences qui sautent aux yeux du lecteur. Voici comment en construire une qui tienne, du roman unique à la saga en plusieurs tomes.</p>

<h2>⏳ Une timeline, pour quoi faire</h2>
<p>Écrire, c'est tenir des centaines de fils en même temps&#8239;: qui sait quoi, qui est où, quand, depuis combien de temps. Ta mémoire lâche bien avant ton ambition. La timeline décharge ta tête et te sert trois choses concrètes&#8239;:</p>
<ul>
  <li><strong>Traquer les incohérences.</strong> Un personnage à deux endroits le même jour, un enfant qui vieillit de travers, un événement impossible dans ta chronologie&#8239;: la frise les fait ressortir d'un coup d'œil.</li>
  <li><strong>Doser le rythme.</strong> Vue d'ensemble, tu repères les tunnels où rien ne se passe et les moments où tu tasses trop d'action. La tension se pilote à hauteur de frise.</li>
  <li><strong>Retrouver le fil.</strong> Tu reprends ton manuscrit après trois semaines&#8239;? La timeline te remet en selle en trente secondes, au lieu de relire cent pages.</li>
</ul>

<h2>🔀 Chronologie contre ordre des chapitres</h2>
<p>Voici la distinction qui change tout, et que beaucoup d'auteurs confondent. Il existe <strong>deux temps</strong> dans un roman&#8239;:</p>
<ul>
  <li><strong>L'ordre du récit</strong>&#8239;: l'ordre dans lequel tu <em>racontes</em> les choses, chapitre après chapitre.</li>
  <li><strong>L'ordre chronologique</strong>&#8239;: l'ordre dans lequel les choses <em>arrivent</em> réellement dans le monde de l'histoire.</li>
</ul>
<p>Tant que tu racontes tout dans l'ordre, les deux se confondent. Mais dès que tu glisses un flash-back, un prologue situé dans le passé, ou des lignes temporelles parallèles, ils divergent, et c'est là que naissent les erreurs.</p>
${timelineDiagram}
<p>Une bonne timeline te laisse <strong>voir les deux à la fois</strong>. Tu vérifies la cohérence sur l'axe chronologique, et tu pilotes le suspense sur l'axe du récit. Les maîtres du thriller jouent en permanence de l'écart entre ces deux ordres&#8239;: ils te cachent, dans le passé, ce qu'ils révéleront au bon moment.</p>

<h2>🧱 Ce qu'une bonne timeline doit contenir</h2>
<p>Une frise utile ne se limite pas à une liste de dates. Pour chaque événement marquant, garde une trace de&#8239;:</p>
<ul>
  <li><strong>Quand</strong>&#8239;: la date ou le repère temporel (jour 3, an 1247, «&#8239;dix ans avant&#8239;»). Même un temps relatif vaut mieux que rien.</li>
  <li><strong>Où</strong>&#8239;: le lieu, surtout si tes personnages se déplacent beaucoup.</li>
  <li><strong>Qui</strong>&#8239;: les personnages présents, et ce qu'ils apprennent à ce moment. Le fameux «&#8239;qui sait quoi, quand&#8239;» est la clé des révélations.</li>
  <li><strong>Le chapitre</strong>&#8239;: où l'événement est raconté, pour relier l'ordre chronologique à l'ordre du récit.</li>
  <li><strong>L'enjeu</strong>&#8239;: en une ligne, ce que la scène fait avancer. Un événement sans conséquence est un candidat à la coupe.</li>
</ul>

<h2>🪜 Créer ta timeline pas-à-pas</h2>
<ol>
  <li><strong>Liste les événements majeurs.</strong> Ne cherche pas l'exhaustivité tout de suite&#8239;: pose d'abord les grands jalons, ceux dont dépend l'intrigue.</li>
  <li><strong>Range-les dans l'ordre chronologique.</strong> Pas l'ordre des chapitres&#8239;: l'ordre réel des faits, y compris ce qui précède le début du roman.</li>
  <li><strong>Ancre un repère temporel à chacun.</strong> Absolu (une date) ou relatif («&#8239;trois jours plus tard&#8239;»). L'important est que les écarts soient cohérents entre eux.</li>
  <li><strong>Relie chaque événement à son chapitre.</strong> C'est ce lien qui révèle tes flash-backs et tes sauts dans le temps.</li>
  <li><strong>Chasse les collisions.</strong> Deux scènes au même endroit au même moment&#8239;? Un personnage qui devine ce qu'il n'a pas encore appris&#8239;? La frise les met à nu.</li>
  <li><strong>Recule et regarde le rythme.</strong> Des mois sans rien, puis tout en trois jours&#8239;? Vue d'ensemble, tu ajustes la cadence avant que le lecteur ne décroche.</li>
</ol>

<h2>🗺️ La timeline d'une saga multi-tomes</h2>
<p>Sur un roman, une frise suffit. Sur une <strong>saga</strong>, la timeline devient vitale, parce que les erreurs se nichent entre les tomes, là où ta mémoire a le plus de mal.</p>
<ul>
  <li><strong>Les âges qui dérivent.</strong> Cinq ans passent entre le tome 1 et le tome 3&#8239;? Tous tes personnages ont vieilli d'autant. Sans frise, un enfant reste figé pendant que le monde avance.</li>
  <li><strong>Les amorces à distance.</strong> Une promesse semée au tome 1 se paie parfois deux tomes plus loin. La timeline te rappelle quand tu l'as posée, et quand elle doit exploser.</li>
  <li><strong>Les intrigues parallèles.</strong> Quand plusieurs groupes de personnages avancent en même temps dans des lieux différents, il faut que leurs horloges restent synchrones. Une bataille ne peut pas durer trois jours pour l'un et une semaine pour l'autre.</li>
</ul>
<p>Tenir tout ça sur un seul document devient vite ingérable. C'est précisément pour les séries qu'une <strong>timeline outillée</strong> prend son sens&#8239;: filtrer par tome, par personnage, relier chaque événement à son chapitre et à la carte. Atlas Narratif a été pensé pour ça, et va plus loin&#8239;: il croise ta chronologie avec tes lieux et tes personnages pour repérer les incohérences avant tes lecteurs. On détaille ce point dans notre guide sur <a href="/blog/comment-structurer-un-roman">comment structurer un roman</a>.</p>

<h2>⚠️ Les erreurs classiques à éviter</h2>
<ul>
  <li><strong>Confondre les deux ordres.</strong> Ranger ta timeline dans l'ordre des chapitres t'aveugle sur les incohérences chronologiques. Sépare toujours ce qui arrive de ce qui se raconte.</li>
  <li><strong>Le flou temporel.</strong> Enchaîner les «&#8239;quelque temps plus tard&#8239;» sans jamais fixer d'ancrage finit par embrouiller le lecteur, et toi le premier.</li>
  <li><strong>Oublier le hors-champ.</strong> Ce qui s'est passé avant le premier chapitre compte aussi. Les motivations de tes personnages y sont enracinées.</li>
  <li><strong>Une timeline figée dans le marbre.</strong> Ton histoire évolue&#8239;; ta frise doit suivre. Une timeline jamais mise à jour ment plus qu'elle n'aide.</li>
</ul>

<h2>🛠️ Papier, tableur ou outil dédié</h2>
<p>Il n'y a pas de honte à commencer simple. Le bon outil, c'est celui que tu tiens dans la durée.</p>
<ul>
  <li><strong>Le papier ou les post-it.</strong> Parfaits pour dégrossir, très visuels. Leur limite&#8239;: ils ne filtrent rien et se figent vite. Difficile d'y suivre une saga de cinq tomes.</li>
  <li><strong>Le tableur.</strong> Souple, gratuit, il encaisse beaucoup. Mais tu construis tout à la main, et une colonne de dates ne <em>montre</em> pas le rythme&#8239;: il faut le déduire.</li>
  <li><strong>L'outil dédié.</strong> Il visualise la frise, filtre par tome ou par personnage, relie les événements aux chapitres et à la carte, et surtout repère les collisions à ta place. C'est le gain décisif dès que l'histoire grossit.</li>
</ul>
<p>La vue <strong>timeline</strong> d'Atlas Narratif fait exactement ça&#8239;: tu poses tes événements chapitre par chapitre, tu les filtres par tome, et tu vois l'arc émotionnel se dessiner par-dessus. Le tout gratuitement, tes textes chiffrés et sans aucun tracking.</p>
<figure class="blog-figure">
  <img src="/blog/timeline-roman.png" alt="La vue timeline d'Atlas Narratif&#8239;: les chapitres en colonnes, chacun avec ses événements, ses personnages et son POV, et un onglet pour basculer en ordre chronologique." loading="lazy" />
  <figcaption>La timeline chapitre par chapitre, et l'onglet «&#8239;chrono&#8239;» pour passer à l'ordre chronologique (démo LOTR).</figcaption>
</figure>

<h2>✅ En résumé</h2>
<p>Une timeline, c'est ta mémoire externe d'auteur. Retiens l'essentiel&#8239;: distingue toujours l'ordre où les choses <em>arrivent</em> de l'ordre où tu les <em>racontes</em>, ancre tes événements dans le temps, relie-les à tes chapitres, et prends de la hauteur pour piloter le rythme. Sur une saga, ce n'est plus une option.</p>
<p><strong>Atlas Narratif</strong> te donne une timeline claire, filtrable par tome et par personnage, croisée avec ta carte et tes incohérences. L'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Construis la timeline de ton roman gratuitement avec Atlas Narratif.</a> Et si tu as déjà un manuscrit, importe-le pour en obtenir la frise en quelques minutes.</p>
`,
};

const nanoPaceDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 300" role="img" aria-label="Deux courbes sur 30 jours : l'objectif régulier de 1667 mots par jour, et la réalité qui plonge au 'mur de la semaine 2' avant de remonter." style="width:100%;height:auto">
    <g font-family="ui-monospace,Menlo,monospace" font-size="12" fill="#a9a291">
      <text x="20" y="30">50 000 MOTS</text>
      <text x="20" y="250">JOUR 1</text>
      <text x="628" y="250">JOUR 30</text>
    </g>
    <line x1="60" y1="220" x2="680" y2="220" stroke="#ffffff" stroke-opacity="0.14"/>
    <line x1="60" y1="40" x2="60" y2="220" stroke="#ffffff" stroke-opacity="0.14"/>
    <polyline fill="none" stroke="#cba15e" stroke-width="2.5" stroke-dasharray="6 5" points="60,220 680,50"/>
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="60,220 130,196 200,172 270,162 320,176 360,182 400,160 470,120 540,96 610,70 680,50"/>
    <circle cx="340" cy="180" r="4.5" fill="#cba15e"/>
    <g font-family="'Spectral',Georgia,serif" fill="#a9a291" font-size="12.5" text-anchor="middle">
      <text x="340" y="205">le mur de la semaine 2</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11.5">
      <rect x="470" y="264" width="12" height="12" rx="3" fill="#cba15e"/>
      <text x="492" y="274" fill="#a9a291">objectif</text>
      <rect x="560" y="264" width="12" height="12" rx="3" fill="#5cae8e"/>
      <text x="582" y="274" fill="#a9a291">réalité</text>
    </g>
  </svg>
  <figcaption>1667 mots par jour en théorie&#8239;; en pratique, la motivation plonge vers la semaine 2. Un plan solide, c'est ce qui te fait remonter la pente.</figcaption>
</figure>`;

const planifierNanowrimo = {
  slug: 'planifier-nanowrimo-methode',
  pillar: 'P1',
  metaTitle: 'Planifier son NaNoWriMo : la méthode complète',
  title: 'Planifie ton NaNoWriMo : la méthode pour tenir 50 000 mots',
  description:
    'Comment planifier ton NaNoWriMo avant le 1er novembre : choisir une structure, poser tes beats et ta timeline pour écrire 50 000 mots sans t\'enliser.',
  excerpt:
    'Le secret des auteurs qui finissent le NaNoWriMo ? Ils préparent en octobre. Choisis ta structure, pose tes beats, et écris tes 50 000 mots sans t\'enliser.',
  date: '2026-11-01',
  readingTime: '8 min',
  tags: ['NaNoWriMo', 'Méthode', 'Planification', 'Structure'],
  emoji: '📅',
  html: `
<p>Chaque novembre, des centaines de milliers d'auteurs se lancent le même défi&#8239;: écrire 50 000 mots en 30 jours. C'est le NaNoWriMo. Et chaque année, la même statistique tombe&#8239;: la plupart abandonnent avant la fin. Presque toujours au même endroit, autour de la deuxième semaine, quand l'élan retombe et que l'histoire part dans tous les sens.</p>
<p>La différence entre ceux qui franchissent la ligne et les autres tient rarement au talent ou au temps libre. Elle tient à une chose&#8239;: <strong>un plan préparé avant le 1er novembre</strong>. Voici comment t'y prendre.</p>

<h2>📅 NaNoWriMo, le défi des 50 000 mots</h2>
<p>Le principe est simple&#8239;: écrire un premier jet de roman, 50 000 mots, entre le 1er et le 30 novembre. Soit environ <strong>1667 mots par jour</strong>, tous les jours, pendant un mois. L'idée n'est pas d'écrire un chef-d'œuvre, mais de <em>finir un jet</em>, en imposant silence à ton éditeur intérieur.</p>
<p>Ce rythme paraît tenable sur le papier. Le piège n'est pas la vitesse d'écriture&#8239;: c'est de savoir <em>quoi</em> écrire chaque jour. C'est là que le plan fait toute la différence.</p>
${nanoPaceDiagram}

<h2>🧭 Planifier ou foncer</h2>
<p>Dans la communauté, deux écoles s'affrontent&#8239;: les <strong>planners</strong> (qui préparent tout) et les <strong>pantsers</strong> (qui écrivent à l'instinct, «&#8239;au feeling&#8239;»). Les deux peuvent gagner le NaNoWriMo, mais pour un premier, planifier change radicalement les chances.</p>
<p>Pourquoi&#8239;? Parce que le pantsing t'expose à la panne&#8239;: tu ouvres ton document au jour 12, et tu ne sais pas ce qui se passe ensuite. Chaque jour sans plan, tu paies une «&#8239;taxe de décision&#8239;» avant même d'écrire un mot. Un plan, même léger, supprime cette taxe&#8239;: tu sais quelle scène écrire, tu écris.</p>
<p>D'où la tradition du <strong>«&#8239;Preptober&#8239;»</strong> (le mois d'octobre consacré à la préparation). Pas besoin d'un mois entier&#8239;: une semaine de prep bien menée suffit largement.</p>

<h2>🗺️ Ton plan en une semaine</h2>
<p>Voici une prep réaliste, à boucler avant le 1er novembre. Chaque étape prend une soirée, pas plus.</p>
<ol>
  <li><strong>Formule ta prémisse en une phrase.</strong> «&#8239;Un jeune fermier découvre un pouvoir et doit affronter un empire.&#8239;» Si tu ne peux pas la résumer, l'histoire n'est pas prête.</li>
  <li><strong>Choisis une structure.</strong> Save the Cat pour une intrigue rythmée, le Voyage du Héros pour une quête ou une initiation. On les compare dans notre guide <a href="/blog/comment-structurer-un-roman">comment structurer un roman</a>.</li>
  <li><strong>Place tes grandes bornes.</strong> Ouverture, catalyseur, midpoint, tout est perdu, climax. Cinq points, et ta colonne vertébrale tient.</li>
  <li><strong>Esquisse tes personnages.</strong> Le héros, ce qui lui manque, ce qu'il veut. Deux ou trois seconds rôles. Pas une bible complète&#8239;: juste de quoi les faire vivre.</li>
  <li><strong>Découpe en scènes.</strong> Transforme tes beats en une liste de scènes à écrire. C'est ta feuille de route quotidienne&#8239;: chaque jour, tu piques dedans.</li>
</ol>
<p>Avec ça, tu n'ouvres jamais une page blanche&#8239;: tu ouvres une scène qui t'attend.</p>

<h2>🏗️ Poser ta structure, concrètement</h2>
<p>Cette prep, tu peux la faire sur papier ou dans un tableur. Mais un outil qui visualise ta structure te fait gagner un temps précieux&#8239;: tu vois d'un coup d'œil les trous, les temps forts qui manquent, les scènes déjà prêtes.</p>
<p>Dans <strong>Atlas Narratif</strong>, tu choisis ta méthode (Save the Cat ou Voyage du Héros), tu poses tes beats sur tes futurs chapitres, et tu repères aussitôt ceux qui sonnent creux. Ta feuille de route de novembre est là, sous tes yeux, avant même d'avoir écrit la première ligne.</p>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif&#8239;: les beats posés sur les chapitres avant le NaNoWriMo, prêts à guider l'écriture jour après jour." loading="lazy" />
  <figcaption>Poser ses beats avant le 1er novembre&#8239;: ta feuille de route quotidienne, prête (démo LOTR).</figcaption>
</figure>

<h2>🏃 Tenir les 30 jours</h2>
<p>La prep gagne la moitié de la bataille&#8239;; l'autre moitié, c'est la régularité. Quelques repères pour ne pas lâcher&#8239;:</p>
<ul>
  <li><strong>Écris tous les jours, même mal.</strong> 1667 mots imparfaits valent mieux que 0 mot parfait. Le premier jet a le droit d'être moche.</li>
  <li><strong>Ne te relis pas.</strong> Corriger en cours de route est le meilleur moyen de t'enliser. Tu réviseras en décembre.</li>
  <li><strong>Prends un peu d'avance au début.</strong> L'énergie du jour 1 est un cadeau&#8239;: le coussin de mots que tu te constitues t'amortira le fameux mur de la semaine 2.</li>
  <li><strong>Appuie-toi sur ton plan quand ça coince.</strong> Panne d'inspiration&#8239;? Retourne à ta liste de scènes et écris la suivante. Ta feuille de route est ton filet.</li>
</ul>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Partir sans aucun plan.</strong> C'est le billet le plus court vers l'abandon en semaine 2.</li>
  <li><strong>Trop planifier.</strong> À l'inverse, passer octobre à peaufiner une bible de 200 pages, c'est fuir l'écriture. Un plan léger suffit&#8239;: garde du carburant pour novembre.</li>
  <li><strong>Viser la perfection.</strong> Le NaNoWriMo produit un premier jet, pas un manuscrit fini. Confonds les deux et tu cales dès le chapitre 3.</li>
  <li><strong>Écrire dans le désordre sans repère.</strong> Sauter de scène en scène, c'est permis&#8239;; mais sans timeline, tu perds vite le fil de qui sait quoi et quand.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Le NaNoWriMo ne se gagne pas au talent, mais à la préparation. Une semaine de prep en octobre&#8239;: une prémisse claire, une structure choisie, cinq bornes posées, tes scènes découpées. Ensuite, tu écris, sans te relire, sans viser la perfection, en t'appuyant sur ton plan les jours difficiles.</p>
<p><strong>Atlas Narratif</strong> est l'atelier idéal pour ta prep&#8239;: pose ta structure (Save the Cat ou Voyage du Héros), visualise ta timeline et tes personnages, et arrive au 1er novembre avec une carte au lieu d'une page blanche. Gratuit, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Prépare ton NaNoWriMo gratuitement avec Atlas Narratif.</a> Choisis ta méthode, pose tes beats, et lance-toi le 1er novembre avec un plan.</p>
`,
};

const structureLOTR = {
  slug: 'structure-seigneur-des-anneaux',
  pillar: 'P3',
  metaTitle: 'La structure du Seigneur des Anneaux décortiquée',
  title: 'La structure du Seigneur des Anneaux décortiquée',
  description:
    'Save the Cat, Voyage du Héros, amorces et paiements : on décortique la structure narrative du Seigneur des Anneaux, tome par tome, comme un cas d\'école.',
  excerpt:
    'Pourquoi la saga de Tolkien tient-elle si bien debout ? On décortique sa structure : beats, arcs entrelacés, amorces payées trois tomes plus loin.',
  date: '2026-11-03',
  readingTime: '10 min',
  tags: ['Le Seigneur des Anneaux', 'Étude de cas', 'Structure', 'Saga'],
  emoji: '💍',
  html: `
<p>On peut lire <em>Le Seigneur des Anneaux</em> comme un lecteur, emporté par le souffle. On peut aussi l'ouvrir comme un auteur, pour comprendre <em>pourquoi</em> ça marche. Trois tomes, des dizaines de personnages, une géographie entière, des fils semés au premier chapitre et payés mille pages plus loin&#8239;: et pourtant, tout tient.</p>
<p>C'est le cas d'école parfait. Décortiquons la structure de la saga de Tolkien avec les mêmes outils que tu appliquerais à la tienne&#8239;: les beats, les arcs de héros, les amorces et paiements. Tout ce que tu vois ici a été passé dans Atlas Narratif&#8239;: c'est la démo que tu peux explorer toi-même.</p>

<h2>💍 Pourquoi LOTR est un cas d'école</h2>
<p>Une histoire courte pardonne les faiblesses de structure&#8239;: on arrive au bout avant qu'elles ne gênent. Une <strong>saga</strong>, non. Sur trois tomes, la moindre promesse oubliée, le moindre arc qui s'affaisse se paient cash. Que <em>Le Seigneur des Anneaux</em> tienne sur cette distance n'a rien d'un miracle&#8239;: c'est de l'architecture.</p>
<p>Et cette architecture est lisible. Tolkien n'a pas suivi de méthode moderne (elles sont venues après lui), mais son récit épouse ces schémas avec une précision qui en fait le meilleur terrain d'apprentissage qui soit.</p>

<h2>🎬 LOTR vu par Save the Cat</h2>
<p>Prends la trame de <em>La Communauté de l'Anneau</em> et pose-la sur les 15 beats de Save the Cat&#8239;: l'emboîtement est frappant.</p>
<ul>
  <li><strong>Image d'ouverture</strong>&#8239;: la Comté, paisible, hors du temps. Un paradis qu'on apprend à aimer avant de le voir menacé.</li>
  <li><strong>Catalyseur</strong>&#8239;: Gandalf révèle la vérité sur l'Anneau. La routine de Frodon vole en éclats.</li>
  <li><strong>Passage au deuxième acte</strong>&#8239;: Frodon quitte la Comté. Plus de retour possible.</li>
  <li><strong>Midpoint</strong>&#8239;: la Moria, la chute de Gandalf. Une fausse défaite qui soude et endeuille la Communauté.</li>
  <li><strong>Tout est perdu</strong>&#8239;: la Communauté se brise à Amon Hen, Boromir tombe.</li>
  <li><strong>Image finale</strong>&#8239;: Frodon et Sam, seuls, choisissent la route du Mordor. La quête, désormais, sera intime.</li>
</ul>
<p>Chaque tome rejoue ensuite sa propre courbe. C'est la clé des sagas&#8239;: un grand arc d'ensemble, et dans chaque tome un arc complet en miniature.</p>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif&#8239;: les 15 beats du Seigneur des Anneaux placés sur les chapitres, répartis sur les trois actes." loading="lazy" />
  <figcaption>Les 15 beats de Save the Cat posés sur la trilogie, chapitre par chapitre (démo LOTR).</figcaption>
</figure>

<h2>🧭 Les Voyages du Héros entrelacés</h2>
<p>Le vrai tour de force de Tolkien, c'est de faire vivre <strong>plusieurs Voyages du Héros en parallèle</strong>, décalés dans le temps, qui s'éclairent l'un l'autre&#8239;:</p>
<ul>
  <li><strong>Frodon</strong> suit le voyage du porteur du fardeau&#8239;: son épreuve est intérieure, l'Anneau le ronge. Son «&#8239;retour avec l'élixir&#8239;» est doux-amer&#8239;: il sauve la Comté mais ne peut plus y vivre.</li>
  <li><strong>Aragorn</strong> incarne le voyage du roi réticent&#8239;: du rôdeur dans l'ombre au souverain qui assume sa couronne. Un arc d'acceptation de soi.</li>
  <li><strong>Sam</strong>, souvent oublié, accomplit peut-être le plus bel arc&#8239;: le jardinier ordinaire qui se révèle le véritable héros de la quête.</li>
</ul>
<p>Ces trois courbes ne montent pas au même rythme, et c'est voulu&#8239;: quand l'une redescend, une autre s'élève. C'est ce tressage qui tient le lecteur en haleine sur trois tomes.</p>
<figure class="blog-figure">
  <img src="/blog/voyage-du-heros.png" alt="La vue Voyage du Héros dans Atlas Narratif&#8239;: les 12 étapes de l'arc d'Aragorn, du rôdeur au roi, réparties en trois phases." loading="lazy" />
  <figcaption>L'arc d'Aragorn, du rôdeur au roi, en 12 étapes (démo LOTR).</figcaption>
</figure>

<h2>🌱 Les amorces payées trois tomes plus loin</h2>
<p>C'est ici que la maîtrise de Tolkien éclate. Des promesses semées très tôt trouvent leur paiement des centaines de pages plus loin&#8239;:</p>
<ul>
  <li><strong>Narsil, l'épée brisée.</strong> Reforgée en Andúril dès Fondcombe, au tome 1, elle accompagne Aragorn tout au long du voyage&#8239;; mais son plein paiement symbolique n'éclate qu'au tome 3, quand il la brandit pour assumer sa couronne. L'amorce et son paiement encadrent toute la saga.</li>
  <li><strong>La fiole de Galadriel.</strong> Simple cadeau d'adieu au tome 1, elle sauve Frodon et Sam d'Arachne au tome 2. Une promesse discrète, un paiement crucial.</li>
  <li><strong>La pitié envers Gollum.</strong> Frodon épargne Gollum&#8239;; Gandalf lui souffle que ce dernier a peut-être encore un rôle à jouer. Le paiement&#8239;? Sans Gollum, l'Anneau n'aurait jamais été détruit au Mont Destin.</li>
</ul>
<p>Aucune de ces amorces n'est là par hasard. Chacune est une dette narrative que Tolkien contracte tôt et rembourse au moment exact où elle fera le plus d'effet. Tenir ce fil sur trois tomes, de tête, est quasi impossible&#8239;: c'est exactement ce que traque le suivi des amorces et paiements.</p>
<figure class="blog-figure">
  <img src="/blog/amorces-paiements.png" alt="Le suivi des amorces et paiements dans Atlas Narratif&#8239;: chaque promesse du Seigneur des Anneaux reliée du chapitre où elle est posée à celui où elle est résolue." loading="lazy" />
  <figcaption>Chaque amorce reliée à son paiement, d'un tome à l'autre (démo LOTR).</figcaption>
</figure>

<h2>🗺️ La géographie comme structure</h2>
<p>Chez Tolkien, la carte n'est pas un décor&#8239;: c'est une colonne vertébrale. La quête <em>est</em> un déplacement, de la Comté au Mont Destin, et la progression géographique épouse la montée de la tension. Plus on approche du Mordor, plus l'étau se resserre.</p>
<p>Visualiser les trajets de chaque personnage sur une carte, c'est vérifier d'un coup d'œil la cohérence des distances, des temps de voyage, des retrouvailles. Pour une saga à la géographie dense, c'est un garde-fou autant qu'un plaisir.</p>
<figure class="blog-figure">
  <img src="/blog/lotr-carte.png" alt="La carte interactive d'Atlas Narratif&#8239;: les trajets des personnages du Seigneur des Anneaux tracés à travers la Terre du Milieu, de la Comté au Mordor." loading="lazy" />
  <figcaption>Les trajets des personnages tracés sur la Terre du Milieu (démo LOTR).</figcaption>
</figure>

<h2>📚 Ce que ça t'apprend pour ta saga</h2>
<p>Tu n'écriras pas <em>Le Seigneur des Anneaux</em>, et c'est très bien. Mais trois leçons de structure valent pour n'importe quelle série&#8239;:</p>
<ul>
  <li><strong>Un grand arc, et un arc par tome.</strong> Chaque volume doit se tenir seul tout en servant l'ensemble.</li>
  <li><strong>Entrelace tes arcs de personnages.</strong> Décale les courbes pour qu'il y ait toujours une tension qui monte quelque part.</li>
  <li><strong>Tiens le registre de tes promesses.</strong> Chaque amorce est une dette&#8239;: note-la, et paie-la au meilleur moment.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Si <em>Le Seigneur des Anneaux</em> traverse trois tomes sans faiblir, ce n'est pas magique&#8239;: c'est une structure d'orfèvre. Des beats bien placés, des Voyages du Héros entrelacés, des amorces semées tôt et payées au bon moment, une géographie qui porte la tension. Les mêmes outils sont à ta portée pour ta propre saga.</p>
<p>Tout ce que tu viens de voir vit dans la <strong>démo d'Atlas Narratif</strong>&#8239;: la trilogie entière, ses beats, ses arcs, ses amorces et sa carte. Explore-la sans créer de compte, puis structure la tienne. L'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com/demo">Explore la structure du Seigneur des Anneaux dans la démo</a>, puis lance ta propre saga gratuitement.</p>
`,
};

const detecterIncoherences = {
  slug: 'detecter-incoherences-roman',
  pillar: 'P1',
  metaTitle: 'Détecter les incohérences de son roman : la checklist',
  title: 'Détecter les incohérences dans ton roman : la checklist',
  description:
    'La checklist pour détecter les incohérences de ton roman : continuité, chronologie, personnages, univers, intrigue. Repère-les avant tes lecteurs.',
  excerpt:
    'Yeux qui changent de couleur, âge qui dérive, amorce oubliée : la checklist des cinq familles d\'incohérences, pour les traquer avant tes lecteurs.',
  date: '2026-12-01',
  readingTime: '8 min',
  tags: ['Incohérences', 'Cohérence', 'Relecture', 'Checklist'],
  emoji: '🔍',
  html: `
<p>Un lecteur pardonne beaucoup de choses. Une intrigue un peu lente, un style perfectible, un personnage secondaire sous-exploité. Mais il y a une faute qui le fait décrocher net&#8239;: l'incohérence. Le personnage aux yeux verts au tome 1, bleus au tome 3. Le trajet qui prend trois jours à l'aller et une semaine au retour. La promesse du chapitre 3 qu'on attend encore à la fin.</p>
<p>Ces failles cassent l'immersion et, pire, la confiance. Voici comment les traquer méthodiquement, avec une checklist par famille et les bons réflexes de relecture.</p>

<h2>🔍 Pourquoi une incohérence casse tout</h2>
<p>Quand un lecteur plonge dans ton roman, il signe un pacte&#8239;: il accepte de croire à ton monde. Chaque incohérence rompt ce pacte. Le charme se brise, le lecteur sort de l'histoire, et surtout il commence à <em>douter</em> de tout le reste. Une seule contradiction visible, et il se met à chercher les autres.</p>
<p>Le problème, c'est que ces failles sont presque invisibles pour toi. Tu connais ton histoire par cœur&#8239;; ton cerveau corrige automatiquement ce qui cloche. C'est justement pour ça qu'une <strong>méthode</strong> vaut mieux qu'une relecture au feeling.</p>

<h2>🧩 Les cinq familles d'incohérences</h2>
<p>Presque toutes les incohérences se rangent dans cinq familles. Les connaître, c'est savoir où regarder.</p>
<h3>1. La continuité</h3>
<p>Les détails physiques et matériels qui changent sans raison&#8239;: couleur des yeux ou des cheveux, cicatrice qui disparaît, objet perdu puis réutilisé, vêtement qui change en pleine scène. Ce sont les plus fréquentes et les plus repérables par le lecteur.</p>
<h3>2. La chronologie</h3>
<p>Tout ce qui touche au temps&#8239;: l'âge d'un personnage qui ne colle pas, un temps de voyage incohérent, deux scènes impossibles au même moment, une saison qui saute. Et le piège classique&#8239;: <strong>qui sait quoi, et quand&#8239;?</strong> Un personnage ne peut pas réagir à une information qu'il n'a pas encore reçue.</p>
<h3>3. Les personnages</h3>
<p>Un comportement qui trahit la personnalité établie, une voix qui change, une motivation qui s'évapore, un nom mal orthographié d'un chapitre à l'autre. Le lecteur connaît tes personnages&#8239;: il sent tout de suite quand l'un d'eux «&#8239;sort du rôle&#8239;».</p>
<h3>4. L'univers</h3>
<p>Les règles de ton monde doivent tenir&#8239;: une magie qui fonctionne autrement selon les besoins de l'intrigue, une technologie qui apparaît puis disparaît, une géographie qui se contredit, une hiérarchie sociale flottante. En fantasy et en SF, c'est le nerf de la crédibilité.</p>
<h3>5. L'intrigue</h3>
<p>Les failles de logique narrative&#8239;: une amorce jamais résolue, une solution qui sort de nulle part (le <em>deus ex machina</em>), un problème que le héros aurait pu régler cent pages plus tôt, un enjeu qu'on oublie en route. Ce sont les plus graves, car elles touchent la charpente.</p>

<h2>✅ Ta checklist de relecture cohérence</h2>
<p>Une fois ton jet terminé, passe l'histoire au crible avec ces questions. Relis en <strong>traquant une famille à la fois</strong>&#8239;: on repère bien mieux en cherchant une seule chose.</p>
<ol>
  <li><strong>Fiches personnages.</strong> Chaque trait physique est-il constant du début à la fin&#8239;? Les noms sont-ils toujours orthographiés pareil&#8239;?</li>
  <li><strong>Ligne du temps.</strong> Les âges, les dates, les durées de trajet s'emboîtent-ils&#8239;? Aucune scène n'en chevauche une autre&#8239;?</li>
  <li><strong>Qui sait quoi.</strong> Pour chaque révélation, vérifie que ceux qui réagissent l'ont bien apprise avant.</li>
  <li><strong>Règles du monde.</strong> Ta magie, ta techno, ta géographie obéissent-elles aux mêmes lois d'un bout à l'autre&#8239;?</li>
  <li><strong>Promesses tenues.</strong> Chaque amorce trouve-t-elle son paiement&#8239;? Chaque objet mis en avant sert-il&#8239;?</li>
  <li><strong>Comportements.</strong> Chaque personnage agit-il selon ce qu'on sait de lui&#8239;? Ses volte-face sont-elles justifiées&#8239;?</li>
</ol>

<h2>🤖 Détecter automatiquement</h2>
<p>Cette relecture est indispensable, mais elle est fastidieuse, surtout sur un long manuscrit. C'est exactement le genre de travail qu'une machine fait sans se fatiguer&#8239;: comparer des centaines de détails et signaler ce qui cloche.</p>
<p>Le détecteur d'incohérences d'<strong>Atlas Narratif</strong> passe ton histoire au crible avec plus de 12 détecteurs, puis trie les problèmes par gravité&#8239;: du critique au faible. Chaque incohérence est expliquée, reliée aux entités concernées, et accompagnée d'une piste de correction.</p>
<figure class="blog-figure">
  <img src="/blog/incoherences-checklist.png" alt="Le détecteur d'incohérences d'Atlas Narratif&#8239;: les incohérences classées par gravité (critique, élevée, moyenne, faible), chacune expliquée avec un bouton pour la corriger." loading="lazy" />
  <figcaption>Chaque incohérence est expliquée et reliée aux entités concernées (démo LOTR).</figcaption>
</figure>

<h2>🗺️ Le cas des sagas</h2>
<p>Sur un roman unique, la relecture manuelle reste tenable. Sur une <strong>saga</strong> de plusieurs tomes et centaines de milliers de mots, c'est une autre affaire&#8239;: les incohérences se glissent entre les tomes, là où ta mémoire lâche. Un personnage vieillit de travers, une règle du monde dérive, une amorce du tome 1 se perd. C'est là qu'une détection outillée devient un vrai garde-fou. On en parle dans notre guide sur <a href="/blog/gerer-plusieurs-tomes-saga">comment gérer plusieurs tomes sans perdre le fil</a>.</p>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Relire tout en même temps.</strong> Chercher toutes les familles d'un coup, c'est n'en repérer aucune. Une passe = une famille.</li>
  <li><strong>Relire à chaud.</strong> Juste après avoir écrit, ton cerveau corrige tout seul. Laisse reposer quelques jours avant la passe cohérence.</li>
  <li><strong>Se fier à sa seule mémoire.</strong> Tiens des fiches, une timeline, un registre d'amorces. La mémoire ment, surtout sur la durée.</li>
  <li><strong>Confondre incohérence et mystère.</strong> Une zone d'ombre volontaire n'est pas une faille&#8239;: garde une trace de ce qui est intentionnel pour ne pas «&#8239;corriger&#8239;» un vrai ressort.</li>
</ul>

<h2>🧭 En résumé</h2>
<p>Une incohérence, c'est une fissure dans le pacte que tu passes avec ton lecteur. Traque-les par famille, continuité, chronologie, personnages, univers, intrigue, une passe à la fois, et appuie-toi sur des fiches plutôt que sur ta mémoire. Sur une saga, une détection automatique devient vite indispensable.</p>
<p><strong>Atlas Narratif</strong> repère ces failles pour toi&#8239;: plus de 12 détecteurs, un tri par gravité, une piste de correction pour chacune, et un suivi de tes amorces d'un tome à l'autre. Gratuit, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Traque les incohérences de ton roman gratuitement avec Atlas Narratif.</a> Et si tu as déjà un manuscrit, importe-le pour lancer la détection en quelques minutes.</p>
`,
};

const sagaArcsDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 300" role="img" aria-label="Un grand arc en pointillé qui monte à travers trois tomes, et sous lui l'arc propre à chaque tome, qui monte et redescend en partie." style="width:100%;height:auto">
    <line x1="60" y1="240" x2="680" y2="240" stroke="#ffffff" stroke-opacity="0.14"/>
    <line x1="266" y1="60" x2="266" y2="240" stroke="#ffffff" stroke-opacity="0.1"/>
    <line x1="473" y1="60" x2="473" y2="240" stroke="#ffffff" stroke-opacity="0.1"/>
    <polyline fill="none" stroke="#cba15e" stroke-width="2.5" stroke-dasharray="6 5" points="60,215 680,66"/>
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="60,215 120,150 200,132 266,178 330,140 400,104 473,150 540,120 610,78 680,66"/>
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="15" text-anchor="middle">
      <text x="163" y="268">TOME 1</text>
      <text x="369" y="268">TOME 2</text>
      <text x="576" y="268">TOME 3</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11.5">
      <rect x="150" y="20" width="12" height="12" rx="3" fill="#cba15e"/>
      <text x="172" y="30" fill="#a9a291">le grand arc, sur toute la saga</text>
      <rect x="430" y="20" width="12" height="12" rx="3" fill="#5cae8e"/>
      <text x="452" y="30" fill="#a9a291">l'arc propre à chaque tome</text>
    </g>
  </svg>
  <figcaption>Deux niveaux à tenir en même temps&#8239;: le grand arc qui monte sur toute la saga, et l'arc complet de chaque tome.</figcaption>
</figure>`;

const gererPlusieursTomes = {
  slug: 'gerer-plusieurs-tomes-saga',
  pillar: 'P2',
  metaTitle: 'Gérer plusieurs tomes : écrire une saga sans se perdre',
  title: 'Comment gérer plusieurs tomes sans perdre le fil',
  description:
    'Écrire une saga en plusieurs tomes sans perdre le fil : grand arc et arcs de tome, amorces cross-tomes, cohérence sur la durée. La méthode complète.',
  excerpt:
    'Pourquoi le tome 2 fait caler tant de sagas ? Grand arc, arcs de tome, amorces qui traversent les volumes : la méthode pour tenir une série entière.',
  date: '2026-12-02',
  readingTime: '9 min',
  tags: ['Saga', 'Multi-tomes', 'Cohérence', 'Méthode'],
  emoji: '📚',
  html: `
<p>Écrire <em>un</em> roman est difficile. Écrire <em>une série</em> de trois, cinq, sept tomes qui tiennent ensemble, c'est un autre métier. Beaucoup d'auteurs se lancent, portés par l'élan du premier tome, et s'enlisent au deuxième. Trop de fils à tenir, une intrigue qui se dilue, des détails qu'on ne retrouve plus.</p>
<p>Écrire une saga, ce n'est pas empiler des romans&#8239;: c'est bâtir une architecture à deux étages. Voici comment garder le fil, du tome 1 au dernier point final.</p>

<h2>📚 Pourquoi le tome 2 est un piège</h2>
<p>Le premier tome bénéficie de tout&#8239;: l'énergie de la découverte, la nouveauté du monde, un arc que tu as sans doute mûri des années. Le tome 2 n'a rien de tout ça. Il doit relancer sans tout réexpliquer, avancer sans conclure, tenir la tension sans le vernis du neuf.</p>
<p>C'est le fameux <strong>«&#8239;syndrome du tome 2&#8239;»</strong>&#8239;: un volume qui n'est qu'un long couloir entre l'ouverture éclatante et le grand final. La cause est presque toujours la même&#8239;: le tome n'a pas <em>son propre</em> arc. Ce qui nous amène à la clé de toute saga.</p>

<h2>🏛️ Grand arc et arcs de tome</h2>
<p>Une saga se pilote sur <strong>deux niveaux à la fois</strong>&#8239;:</p>
<ul>
  <li><strong>Le grand arc</strong> traverse toute la série&#8239;: la question centrale posée au tome 1 ne trouve sa réponse qu'au dernier. C'est la destruction de l'Anneau, la chute de l'Empire, la vengeance accomplie.</li>
  <li><strong>L'arc de chaque tome</strong> est une histoire complète en miniature&#8239;: son propre objectif, son climax, sa résolution partielle. Le tome doit se tenir seul <em>tout en</em> faisant avancer le grand arc.</li>
</ul>
<p>Un tome sans arc propre s'affaisse&#8239;; un tome qui ignore le grand arc n'est qu'un épisode hors-sol. La maîtrise, c'est de tenir les deux ensemble.</p>
${sagaArcsDiagram}

<h2>🌱 Les amorces qui traversent les tomes</h2>
<p>Sur un roman, une amorce posée au chapitre 3 se paie au chapitre 30. Sur une saga, elle peut se payer <strong>deux tomes plus loin</strong>, et c'est là que naissent les plus beaux effets, comme les plus gros oublis.</p>
<p>Une lame trouvée dans un tumulus au tome 1, la seule capable de briser le sortilège du Roi-Sorcier deux tomes plus tard. Un cadeau anodin qui sauve un héros deux volumes plus loin. Un détail glissé négligemment qui devient la clé du dénouement. Chaque amorce est une <strong>dette narrative</strong>&#8239;: si tu ne la notes pas, tu finiras par la perdre, et le lecteur, lui, s'en souviendra. Tenir ce registre à l'échelle de la série entière est vital.</p>
<figure class="blog-figure">
  <img src="/blog/amorces-paiements.png" alt="Le suivi des amorces et paiements dans Atlas Narratif&#8239;: chaque promesse reliée du tome où elle est posée à celui où elle est résolue, avec son statut." loading="lazy" />
  <figcaption>Chaque amorce suivie de sa mise en place à son paiement, d'un tome à l'autre (démo LOTR).</figcaption>
</figure>

<h2>🧭 Tenir la cohérence sur la durée</h2>
<p>Plus une saga s'étend, plus les incohérences se multiplient, et elles se cachent <em>entre</em> les tomes, là où ta mémoire faiblit. Trois points de vigilance&#8239;:</p>
<ul>
  <li><strong>Les âges et le temps.</strong> Si cinq ans séparent le tome 1 du tome 3, tous tes personnages ont vieilli d'autant. Une timeline à l'échelle de la série t'évite le piège de l'enfant resté figé pendant que le monde vieillit.</li>
  <li><strong>Les règles du monde.</strong> Ta magie, ta géographie, ta politique doivent obéir aux mêmes lois du premier au dernier tome. Une bible d'univers tenue à jour est ta référence.</li>
  <li><strong>Qui sait quoi, et depuis quand.</strong> Sur des milliers de pages, il est facile de faire réagir un personnage à une information qu'il n'a pas encore.</li>
</ul>
<p>Traquer tout ça à la main, sur une série entière, est presque impossible. C'est le rôle d'un <a href="/blog/detecter-incoherences-roman">détecteur d'incohérences</a>, qui compare les détails d'un tome à l'autre et signale ce qui dérive.</p>

<h2>🗺️ La géographie, colonne vertébrale de la saga</h2>
<p>Dans une série, les personnages se dispersent, se retrouvent, parcourent des continents. Visualiser leurs trajets sur une carte, tome après tome, c'est vérifier d'un coup d'œil la cohérence des distances et des retrouvailles, et repérer qui est où à chaque instant.</p>
<figure class="blog-figure">
  <img src="/blog/lotr-carte.png" alt="La carte interactive d'Atlas Narratif&#8239;: les trajets des personnages tracés à travers la Terre du Milieu, d'un tome à l'autre." loading="lazy" />
  <figcaption>Les trajets des personnages tracés sur toute la saga, tome après tome (démo LOTR).</figcaption>
</figure>

<h2>🧩 Piloter une saga, pas-à-pas</h2>
<ol>
  <li><strong>Définis ton grand arc en une phrase.</strong> La question centrale de toute la série, et sa réponse au dernier tome.</li>
  <li><strong>Donne à chaque tome son propre arc.</strong> Un objectif, un climax, une résolution partielle qui fait avancer le tout.</li>
  <li><strong>Tiens un registre d'amorces à l'échelle de la série.</strong> Ce que tu promets, et le tome où tu comptes le payer.</li>
  <li><strong>Maintiens une bible et une timeline vivantes.</strong> Personnages, règles du monde, chronologie&#8239;: mets-les à jour au fil de l'écriture.</li>
  <li><strong>Fais une passe cohérence entre chaque tome.</strong> Ne laisse pas les failles s'accumuler d'un volume à l'autre.</li>
</ol>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Le tome tunnel.</strong> Un volume sans arc propre, simple pont vers le final. Chaque tome doit tenir debout tout seul.</li>
  <li><strong>Les amorces oubliées.</strong> Semer sans jamais récolter&#8239;: le lecteur le ressent, même sans savoir nommer sa frustration.</li>
  <li><strong>La bible dans ta tête.</strong> Sur cinq ans d'écriture, la mémoire ne suffit plus. Écris tes règles, tes fiches, ta chronologie.</li>
  <li><strong>Résoudre trop tôt.</strong> Vider tous tes enjeux au tome 1 te laisse les mains vides pour la suite. Garde des cartes en réserve.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Une saga, c'est une architecture à deux étages&#8239;: un grand arc qui court sur toute la série, et un arc complet par tome. Tiens un registre de tes amorces d'un volume à l'autre, maintiens une bible et une timeline vivantes, et fais une passe cohérence entre chaque tome. C'est ainsi qu'on garde le fil sur des milliers de pages.</p>
<p><strong>Atlas Narratif</strong> a été pensé pour les séries&#8239;: filtre par tome, suis tes amorces d'un volume à l'autre, visualise ta timeline et tes trajets, et repère les incohérences avant tes lecteurs. Gratuit, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Construis ta saga sans perdre le fil avec Atlas Narratif.</a> Un tome, puis deux, puis toute une série, gardés sous tes yeux.</p>
`,
};

export const posts = [commentStructurerUnRoman, saveTheCat15Beats, voyageDuHeros, creerTimeline, planifierNanowrimo, structureLOTR, detecterIncoherences, gererPlusieursTomes];

// Articles publiés (hors brouillons) : alimentent l'index /blog, le prerender et le sitemap.
export const getAllPosts = () =>
  posts.filter((p) => !p.draft).sort((a, b) => (a.date < b.date ? 1 : -1));

// Renvoie aussi les brouillons (prévisualisation par URL directe).
export const getPostBySlug = (slug) => posts.find((p) => p.slug === slug) || null;

// Slugs prérendus/sitemap : publiés uniquement (les brouillons ne sont pas mis en ligne).
export const blogSlugs = posts.filter((p) => !p.draft).map((p) => p.slug);
