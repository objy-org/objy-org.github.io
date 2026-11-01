# OBJY verstehen. :id=learn

Ein kleines Projekt. Fünf Ideen, die Objekte leistungsfähig machen.

## Alles beginnt mit einem Objekt. :id=objects

Orbit ist ein Projekt in unserer Anwendung. Sein Objekt enthält einen Namen, einen Status, einen Zahlenwert und eine Liste von Tags. Ergänze verschachtelte Eigenschaften oder neue Felder, wenn das Projekt wächst. Objekte einer Collection müssen nicht alle dieselbe Struktur haben.

![Das Projekt Orbit als JSON-Objekt mit ID, Text, einem Zahlenwert und einem Array von Tags.](assets/site/learn/objects.svg)

[Mehr zum Objektmodell](/content/api.md?id=objects)

## Verbinde deine Objekte. :id=references

Orbit gehört Alex. Speichere eine Referenz auf Alex' Objekt in der Collection `people`. Beim Lesen von Orbit kann OBJY Alex' aktuelle Daten unter `owner.object` auflösen. Ändere Alex einmal; spätere Lesezugriffe können den neuen Wert auflösen.

```json
{
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-42"
  }
}
```

![Orbit verweist über seine owner-Referenz auf Alex. Beim Lesen erscheinen Alex' Daten unter owner.object, ohne eine weitere Kopie zu speichern.](assets/site/learn/references.svg)

[Mehr zu Referenzen](/content/api.md?id=live-references)

## Gestalte deine Collections. :id=collections

Eine Collection fasst Objekte wie unsere Projekte zusammen. Ihre Metadaten bestimmen die Speicherung: `status` indizieren, `score` in einer kompakten Spalte ablegen und ausgewählte Felder direkt zugänglich halten, während größere Objektinhalte komprimiert werden. Beim Lesen erhältst du weiter vollständige Objekte.

```json
{
  "indexes": ["status"],
  "columns": ["score"],
  "tiering": {
    "mode": "compressedMemory",
    "keep": ["name", "status"]
  }
}
```

![Die Collection projects enthält Orbit und weitere Objekte. Gemeinsame Metadaten konfigurieren Indizes, Spalten und Tiering.](assets/site/learn/collections.svg)

[Mehr zu Collection-Metadaten](/content/database.md?id=shape-the-workload-with-metadata)

## Eine API für deine Daten. :id=operations

Erstelle, lies, ändere und lösche deine Projekte. Finde passende Objekte per Abfrage, berechne Summen mit Aggregationen und suche ähnliche Embeddings per Vektorsuche. Jede Operation arbeitet mit demselben Objektmodell.

Für die Collection `projects` findet diese Abfrage aktive Projekte mit einem Wert von mindestens 40:

```js
await projects.find({
  status: "active",
  score: { $gte: 40 }
});
```

![CRUD, Abfragen, Aggregation und Vektorsuche greifen auf dasselbe Projektobjekt Orbit zu.](assets/site/learn/apis.svg)

[Mehr zu Abfragen](/content/api.md?id=query) · [Aggregation](/content/api.md?id=aggregation) · [Vektorsuche](/content/api.md?id=vector-search)

## Deine Objekte leben im RAM. :id=memory

Deine Objekte und ihre Suchstrukturen liegen im Arbeitsspeicher. Heiße Felder sind direkt zugänglich, Spalten speichern ausgewählte Werte kompakt, komprimierte Felder werden bei Bedarf entpackt. Über Metadaten stimmst du das auf deine Anwendung ab.

Die Engine läuft direkt im Browser oder in Node.js. Der DB Server ergänzt denselben Kern um Authentifizierung, Berechtigungen, gemeinsamen Zugriff, Cluster und optionale Persistenz.

![Orbit gelangt in eine RAM-förmige Speicherebene mit drei Blöcken: heiße Felder, kompakte Spalten und komprimierte Daten.](assets/site/learn/memory.svg)

[Mehr zur Engine](/content/database.md?id=memory-is-the-database) · [Loslegen](get-started.md) · [DB Server](/content/server.md?id=what-the-server-adds)
