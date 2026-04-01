import { createLazyFileRoute } from "@tanstack/react-router";
import { SetukWizard } from "@/components/setuk-builder/setuk-wizard";

export const Route = createLazyFileRoute("/sb/_layout/setuk-builder")({
    component: SetukBuilderPage,
});

function SetukBuilderPage() {
    return (
        <div className="mx-auto w-full max-w-4xl space-y-8 pb-16">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">✨ 세특 마법사 (Setek Builder)</h2>
                <p className="text-gray-500">
                    학교 수행평가 과제를 목표 전공(학과)과 엮어 매력적인 세특으로 탈바꿈시켜 보세요.
                </p>
            </div>
            
            <SetukWizard />
        </div>
    );
}
