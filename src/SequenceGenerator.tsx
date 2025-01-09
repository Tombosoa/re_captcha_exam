import React, { useState } from "react";
import { useAWSWAFCaptchaFetch } from "./aws-waf-captcha/useAWSWAFCaptchaFetch";

const SequenceGenerator: React.FC = () => {
  const [number, setNumber] = useState<number | "">("");
  const [sequence, setSequence] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaFetch = useAWSWAFCaptchaFetch();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (typeof number !== "number" || number < 1 || number > 1000) {
      console.log("Veuillez entrer un nombre entre 1 et 1000.");
      return;
    }

    setSequence([]);
    setIsSubmitting(true);

    for (let i = 1; i <= number; i++) {
      try {
        const response = await fetch("https://api.prod.jcloudify.com/whoami");

        if (response.status === 405) {
          console.log("Un CAPTCHA est requis. Veuillez le résoudre pour continuer.");
          await captchaFetch("", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          console.log("CAPTCHA résolu. Reprise de la séquence.");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        setSequence((prev) => [...prev, `${i}. Forbidden`]);
      } catch (error) {
        console.error("Erreur lors de l'appel API :", error);
        setSequence((prev) => [...prev, `${i}. Erreur`]);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      {!isSubmitting && sequence.length === 0 && (
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Entrez un nombre entre 1 et 1000"
            value={number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNumber(Number(e.target.value) || "")
            }
          />
          <button type="submit">Soumettre</button>
        </form>
      )}

      {isSubmitting && (
        <div>
          {sequence.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      )}

      {!isSubmitting && sequence.length > 0 && (
        <button onClick={() => setSequence([])}>Réinitialiser</button>
      )}
    </div>
  );
};

export default SequenceGenerator;
