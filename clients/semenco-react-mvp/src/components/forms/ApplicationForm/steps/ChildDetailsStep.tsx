import { TextField } from "@/components/forms/fields/TextField";

/**
 * Step 4 — child / young person. Only essential, non-sensitive details.
 * No BSN, passport or insurance numbers are requested.
 */
export function ChildDetailsStep() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="childFirstName" label="Voornaam kind of jongere" required />
        <TextField
          name="childAge"
          label="Leeftijd of geboortejaar"
          description="Bijvoorbeeld “9 jaar” of “2016”."
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="childMunicipality"
          label="Gemeente of woonplaats"
          description="Een globale plaats is voldoende."
          required
        />
        <TextField
          name="childDaytime"
          label="School of dagbesteding (optioneel)"
          description="Bijvoorbeeld school, klas of dagbesteding — algemeen."
        />
      </div>
    </div>
  );
}
