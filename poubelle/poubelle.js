// ESSAIS BIBIL
// IGNORER

addBox("bebox", myId);

setText("bebox", "");

addButton = function(box, txt, col, fct) {
  let span = `<span style="background-color:${col}; border-radius:7px; padding: 10px; margin: 0 5px;" contenteditable=“false” onclick=${fct}><b>${txt}</b></span>`;
  appendText(box, span);
};

let loip = function(afterBox) {
  let id = "b" + rnd(1, 100);
  addBox(id, afterBox);
  setText(
    id,
    `<br><span style="background-color:red; border-radius:7px; padding: 10px; margin: 0 5px;"><b>fraternité</b></span><br><br>Le 6 juillet 2018, le Conseil constitutionnel a reconnu le troisième terme de la devise de la République — la fraternité — comme un principe à valeur constitutionnelle, à l’occasion de l’examen d’une question prioritaire de constitutionnalité posée par des avocats de Cédric Herrou, de trois autres plaignants et d'associations de défense des droits de l’homme et d'aide aux migrants. La première application de ce nouveau principe a été réalisée dans la même décision pour considérer comme contraire à la constitution trois mots (« au séjour irrégulier ») de l’article L622-4 du Code de l'entrée et du séjour des étrangers et du droit d'asile (CESEDA) portant sur le « délit de solidarité » `
  );
};

let fraternite = loip;

appendText("bebox", "<br>");

addButton("bebeox", "liberté", "blue", 'loip("bebox")');

appendText("bebox", "<br>");

addButton("bebeox", "liberté", "blue", 'loip("bebox")');

appendText("bebox", "<br>");

addButton("bebeox", "liberté", "blue", 'loip("bebox")');

appendText("bebox", "<br>");
