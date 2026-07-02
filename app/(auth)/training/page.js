import { verifayAuth } from "@/lib/auth";
import { getTrainings } from "@/lib/training";
import Image from "next/image";
import { redirect } from "next/navigation";

function getTrainingImageSrc(imageName) {
  const normalizedName =
    typeof imageName === "string" ? imageName.replace(/^\/+/, "") : "";

  return normalizedName
    ? `/trainings/${normalizedName}`
    : "/images/auth-icon.jpg";
}

export default async function TrainingPage() {
  const result = await verifayAuth();

  if (!result.user) {
    return redirect("/");
  }

  const trainingSessions = getTrainings();

  return (
    <main>
      <h1>Find your favorite activity</h1>
      <ul id="training-sessions">
        {trainingSessions.map((training) => (
          <li key={training.id}>
            <Image
              src={getTrainingImageSrc(training.image)}
              alt={training.title}
              loading="eager"
              width={250}
              height={250}
            />
            <div>
              <h2>{training.title}</h2>
              <p>{training.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
