import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./custom/button";
import {
  useGetCurrentUser,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { editProfileFormSchema } from "@/lib/validations/edit-profile";
import { debounce } from "lodash";
import { HIGH_SCHOOL_LIST } from "@/constants/high-school";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEditProfile } from "@/stores/server/features/me/mutations";
import { Checkbox } from "./ui/checkbox";

type ProfileFormValues = z.infer<typeof editProfileFormSchema>;

export function EditProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      graduateYear: "2024",
      school: "",
      major: "0",
    },
    mode: "onChange",
  });

  // Queries
  const { data: currentUser, refetch: refetchCurrentUser } =
    useGetCurrentUser();
  const { refetch: refetchSchoolRecords } = useGetSchoolRecords();
  // Mutations
  const editProfile = useEditProfile();

  const [searchHighSchool, setSearchHighSchool] = useState(""); // 학교 검색어 (필터링때문에 form 외에 추가로 만듬)
  const [isFocused, setIsFocused] = useState(false); // 학교검색 포커스
  const [isSmsAgree, setIsSmsAgree] = useState(false);

  // 검색어 변경 시 필터링된 학교 목록 업데이트
  const debouncedSetSearchHighSchool = useMemo(
    () => debounce((term: string) => setSearchHighSchool(term), 200),
    [],
  );

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    form.setValue("school", term);
    debouncedSetSearchHighSchool(term);
  };

  // 검색어로 필터링된 학교 목록
  const filteredHighSchools = useMemo(() => {
    return HIGH_SCHOOL_LIST.filter((school) => {
      if (searchHighSchool === "") return true;
      return school.highschoolName.includes(searchHighSchool);
    });
  }, [searchHighSchool]);

  // 고등학교 리스트가 2000개가 넘어서 렌더링 최적화를 위해 virtual 처리 (tanstack/virtual 사용)
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredHighSchools.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // 초기 데이터 설정
  useEffect(() => {
    if (currentUser) {
      const school = HIGH_SCHOOL_LIST.find(
        (n) => n.id === Number(currentUser.hst_type_id),
      );
      form.setValue("graduateYear", currentUser.graduate_year);
      form.setValue("major", currentUser.major === "LiberalArts" ? "0" : "1");
      if (school) {
        form.setValue("school", school.highschoolName);
      }
      setIsSmsAgree(currentUser.ck_sms_agree);
    }
  }, [currentUser, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    const school = HIGH_SCHOOL_LIST.find(
      (n) => n.highschoolName === data.school,
    );
    // 만약 학교 값이 존재하는데 학교 목록에 없으면 잘못된 학교임으로 에러처리
    if (data.school !== "" && !school) {
      toast.error(
        "잘못된 학교입니다. 리스트에 학교가 없다면 필드를 비워주세요.",
      );
      return;
    }

    // 현재 사용자 정보와 변경할 정보 비교
    const isSchoolChanged = school?.id !== Number(currentUser?.hst_type_id);
    const isMajorChanged =
      (data.major === "0" ? "LiberalArts" : "NaturalSciences") !==
      currentUser?.major;
    const isGraduateYearChanged =
      data.graduateYear !== currentUser?.graduate_year;
    const isSmsAgreeChanged = isSmsAgree !== currentUser?.ck_sms_agree;

    // 변경사항이 없는 경우
    if (
      !isSchoolChanged &&
      !isMajorChanged &&
      !isGraduateYearChanged &&
      !isSmsAgreeChanged
    ) {
      toast.info("변경사항이 없습니다.");
      return;
    }

    const result = await editProfile.mutateAsync({
      hst_type_id: school ? school.id : null,
      ck_sms_agree: isSmsAgree,
      major: Number(data.major),
      graduate_year: data.graduateYear,
    });
    if (result.success) {
      toast.success("성공적으로 프로필을 업데이트 했습니다.");
      await refetchCurrentUser();
      await refetchSchoolRecords();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormItem>
          <FormLabel>아이디</FormLabel>
          <FormControl>
            <Input value={currentUser?.email || "간편 로그인 계정"} disabled />
          </FormControl>
          <FormMessage />
        </FormItem>
        <FormItem>
          <FormLabel>휴대폰 번호</FormLabel>
          <FormControl>
            <Input value={currentUser?.phone || ""} disabled />
          </FormControl>
          <FormDescription>
            휴대폰 번호가 변경된 경우 우측 하단의 상담하기 버튼을 클릭해주세요.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>학교</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="학교 검색(목록에 없으면 비워주세요)"
                    {...field}
                    onFocus={() => setIsFocused(true)}
                    onChange={handleSearchInputChange}
                    autoComplete="off"
                    onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                  />
                </FormControl>
                {isFocused && (
                  <div
                    ref={parentRef}
                    className={cn(
                      "absolute left-0 top-10 z-40 max-h-[400px] w-full overflow-y-auto rounded-b-md border bg-gray-100",
                      "scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-track-slate-300 scrollbar-thumb-primary",
                    )}
                  >
                    <div
                      className="relative w-full"
                      style={{ height: `${totalSize}px` }}
                    >
                      {virtualItems.map((virtualItem) => {
                        const school = filteredHighSchools[virtualItem.index];
                        return (
                          <div
                            key={virtualItem.key}
                            className="absolute left-0 top-0 flex w-full cursor-pointer items-center px-2 text-sm hover:bg-gray-200"
                            style={{
                              height: `${virtualItem.size}px`,
                              transform: `translateY(${virtualItem.start}px)`,
                            }}
                            onClick={() => {
                              setSearchHighSchool(school.highschoolName);
                              form.setValue("school", school.highschoolName);
                            }}
                          >
                            {school.highschoolName} ({school.highschoolRegion})
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="major"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>전공*</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">문과</SelectItem>
                    <SelectItem value="1">이과</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="graduateYear"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>입학년도</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="2027">2024년 (1학년)</SelectItem>
                    <SelectItem value="2026">2023년 (2학년)</SelectItem>
                    <SelectItem value="2025">2022년 (3학년)</SelectItem>
                    <SelectItem value="2024">2021년 (졸업생)</SelectItem>
                    <SelectItem value="2023">2020년 (졸업생)</SelectItem>
                    <SelectItem value="2022">2019년 (졸업생)</SelectItem>
                    <SelectItem value="2021">2018년 (졸업생)</SelectItem>
                    <SelectItem value="2020">2017년 (졸업생)</SelectItem>
                    <SelectItem value="2019">2016년 (졸업생)</SelectItem>
                    <SelectItem value="2018">2015년 (졸업생)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={isSmsAgree}
              onCheckedChange={() => setIsSmsAgree((prev) => !prev)}
            />
          </FormControl>
          <div className="flex w-full justify-between space-y-1 leading-none">
            <FormLabel>SMS 광고성 수신동의</FormLabel>
          </div>
        </FormItem>
        <Button type="submit">프로필 저장</Button>
      </form>
    </Form>
  );
}
