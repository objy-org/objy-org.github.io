<!-- Texte und Bilder in Markdown bearbeiten. Alle :id=... unverändert lassen. -->

# Schnelle In-Memory-Objekte. **Für leistungsstarke Apps und Agenten.** :id=top

> Hochskalierbare In-Memory-Objektdatenbank

Baue mit flexiblen Objekten. Kombiniere dynamische Eigenschaften, Live-Referenzen und Vektoren – und nutze Abfragen, Aggregationen und Vektorsuche direkt im Arbeitsspeicher.

- ![](assets/site/icons/features/flexible-objects.svg) Flexibles JSON
- ![](assets/site/icons/features/query-aggregate.svg) OLTP · OLAP · Vektor
- ![](assets/site/icons/features/hot-compressed.svg) Effiziente Speicherung
- ![](assets/site/icons/features/authentication.svg) API, Auth & Berechtigungen

![Hunderte leere JSON-Objektklammern bilden ein räumliches Objektfeld. Apps, KI-Agenten und APIs sind mit einzelnen Objekten verbunden.](assets/site/applications-objects-scale.svg)


## Der OBJY-Vorteil. :id=feature-highlights

### CRUD, Analytics und Vektorsuche. Eine API. :id=versatile-api

Erstelle und ändere Objekte, analysiere ihre Daten oder finde ähnliche Objekte. Eine API für Anwendungslogik, Analytics und KI.

![CRUD, Abfragen, Aggregation und Vektorsuche greifen auf dieselbe Objekt-API zu.](assets/site/architecture.svg#api)

### Flexible Objekte. Für Apps und Agenten. :id=flexible-objects

Beginne mit JSON. Ergänze verschachtelte Eigenschaften, Arrays, Live-Referenzen oder Vektoren, wenn dein Modell wächst. Deine App und ihre Agenten arbeiten mit denselben Objekten.

![Ein flexibles Aufgabenobjekt kombiniert Titel und Status mit Tags, verschachtelten Details und einem Vektor.](assets/site/architecture.svg#objects)

<details>
<summary>Speichern → finden → ändern. Code ansehen.</summary>

```js
import { createDatabase } from "@objy/db";

const db = createDatabase();
await db.createDatabase("app");
const app = db.database("app");
await app.createCollection("tasks");
const tasks = app.collection("tasks");

// An object can combine different kinds of properties.
await tasks.insert({
  _id: "task-01",
  title: "Launch website",
  status: "open",
  tags: ["design", "AI"],
  details: { priority: 2 },
  _vec: [0.2, 0.8, 0.4]
});
await tasks.ready();

// Find similar objects by their vectors.
const matches = await tasks.search({
  $vector: { vector: [0.21, 0.79, 0.4], limit: 1 }
});

// Add a nested property as your application evolves.
await tasks.patch(matches[0]._id, {
  $set: { status: "ready", "details.reviewed": true }
});
```

Die kurzen Vektoren dienen als Beispiel; deine Anwendung liefert Embeddings aus demselben Modell. [Eingebettet starten →](/get-started/embedded.md)

</details>

### In-Memory-Tempo. Clevere Speicherung. :id=hot-compressed

Halte häufig genutzte Felder direkt verfügbar, aggregiere über kompakte Spalten und komprimiere selten genutzte Daten. Objekte bleiben im Arbeitsspeicher, ohne jedes Feld gleich zu speichern.

![Ein RAM-Modul speichert heiße Felder, kompakte Spalten und komprimierte Daten.](assets/site/architecture.svg#memory)

[So funktioniert OBJY →](/learn.md)

## Was wirst du bauen? :id=object-capabilities

### ![](assets/site/icons/use-cases/agents.svg) KI-Agenten & Gedächtnis :id=use-case-agents

Speichere Erinnerungen und Embeddings gemeinsam. Finde den passenden Kontext per Vektorsuche.

### ![](assets/site/icons/use-cases/analytics.svg) Analytics :id=use-case-analytics

Analysiere deine Daten mit schnellen Filtern und Aggregationen. Berechne Kennzahlen direkt aus deinen Objekten.

### ![](assets/site/icons/use-cases/apps.svg) Anwendungs-Backends :id=use-case-apps

Baue Tools und SaaS-Anwendungen mit integrierten APIs, Authentifizierung, Benutzern und Berechtigungen.

### ![](assets/site/icons/use-cases/anything.svg) Oder etwas ganz anderes... :id=use-case-anything

Deine Objekte. Deine Ideen. Baue, was dir vorschwebt.

---

[OBJY · Baue mit Objekten.](/?id=top) · [Auf GitHub ansehen ↗](https://github.com/objy-org/objy)
