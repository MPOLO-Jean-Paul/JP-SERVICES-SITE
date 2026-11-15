import type { FieldDef } from "./resource-form";
import type { Formation } from "@/server/db/schema";

export function formationFields(f?: Formation | null): FieldDef[] {
  return [
    { name: "titre", label: "Titre de la formation", required: true, value: f?.titre },
    { name: "niveau", label: "Niveau", type: "select", half: true, value: f?.niveau ?? "Débutant", options: ["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"].map((v) => ({ value: v, label: v })) },
    { name: "duree", label: "Durée totale", required: true, half: true, placeholder: "Ex. 8 semaines", value: f?.duree },
    { name: "prix", label: "Tarif (USD)", type: "number", step: "0.01", min: 0, half: true, hint: "0 pour une formation gratuite.", value: f ? Number(f.prix) : 0 },
    { name: "date_debut", label: "Date de rentrée", type: "date", half: true, value: f?.dateDebut ?? "" },
    { name: "description", label: "Description détaillée", type: "textarea", rows: 8, required: true, value: f?.description },
    { name: "modules_liste", label: "Programme (un module par ligne)", type: "textarea", rows: 6, hint: "Chaque ligne devient un module du programme et une option du planning.", value: f?.modulesListe },
    { name: "jours_possibles", label: "Jours proposés", hint: "Séparés par des virgules : Lundi,Mercredi,Samedi", value: f?.joursPossibles ?? "Lundi,Mardi,Mercredi,Jeudi,Vendredi" },
    { name: "heure_debut", label: "Heure de début par défaut", type: "time", half: true, value: f?.heureDebutDefaut?.slice(0, 5) ?? "08:00" },
    { name: "heure_fin", label: "Heure de fin par défaut", type: "time", half: true, value: f?.heureFinDefaut?.slice(0, 5) ?? "12:00" },
    { name: "image", label: "Image de couverture", type: "file", accept: "image/jpeg,image/png,image/webp,image/avif", hint: "Facultatif. Sans image, une couverture est générée automatiquement selon le domaine." },
  ];
}
