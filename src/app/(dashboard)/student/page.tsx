import { getTranslations } from "next-intl/server";

export default async function StudentHomePage() {
  const t = await getTranslations("studentHome");
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">{t("title")}</h1>
      <p className="text-gray-500">{t("subtitle")}</p>
    </div>
  );
}


