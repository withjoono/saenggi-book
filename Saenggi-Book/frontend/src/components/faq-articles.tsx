import { useNavigate } from "@tanstack/react-router";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { IconSchool } from "@tabler/icons-react";

interface FAQProps {
  icon: JSX.Element;
  title: string;
  subTitle?: string;
  description: string;
  link: string;
}

const features: FAQProps[] = [
  {
    icon: <IconSchool className="size-12" />,
    title: "서비스 소개",
    description: "",
    link: "/official/guide",
  },
  {
    icon: <QuestionMarkCircledIcon className="size-12" />,
    title: "생기부 다운로드 안내",
    subTitle: "자주하는 질문",
    description: "",
    link: "/official/faq",
  },
];

export const FAQArticles = () => {
  const navigate = useNavigate();
  return (
    <article className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">FAQ</h3>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {features.map(({ icon, title, subTitle, description, link }) => (
          <Card
            key={title}
            className="cursor-pointer bg-white"
            onClick={() => navigate({ to: link })}
          >
            <CardHeader>
              <CardTitle className="flex flex-col items-center justify-center gap-2">
                {icon}
                <p className="pt-2">{title}</p>
                {subTitle && <p>{subTitle}</p>}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </article>
  );
};
