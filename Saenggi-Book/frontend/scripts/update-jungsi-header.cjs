const fs = require('fs');

const jungsiHeaderContent = `import { IconChevronDown } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button, buttonVariants } from "./custom/button";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { useAuthStore } from "@/stores/client/use-auth-store";
import { useQuery } from "@tanstack/react-query";
import { USER_API } from "@/stores/server/features/me/apis";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu, ArrowLeft } from "lucide-react";
import { clearTokens as clearTokenManager } from "@/lib/api/token-manager";
import { useTokenStore } from "@/stores/atoms/tokens";

/**
 * 정시 서비스 전용 헤더
 * - 정시 관련 메뉴만 표시
 * - "전체 서비스로 돌아가기" 버튼 제공
 */
export const JungsiHeader = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isLoginPage = window.location.pathname === "/auth/login";
  const isTestPage = window.location.pathname === "/test/auth-me";
  const isRegisterPage = window.location.pathname === "/auth/register";
  const isResetPasswordPage = window.location.pathname === "/auth/reset-password";
  const isAuthPage = isLoginPage || isTestPage || isRegisterPage || isResetPasswordPage;

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: USER_API.fetchCurrentUserAPI,
    enabled: !isAuthPage,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { clearTokens } = useAuthStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleLogoutClick = () => {
    clearTokens();
    clearTokenManager();
    useTokenStore.getState().clearTokens();
    queryClient.clear();
    toast.success("안녕히 가세요 👋");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-[1px] bg-gradient-to-r from-slate-900 to-slate-800">
      <div className="mx-auto">
        <div className="container flex h-14 w-screen items-center justify-between lg:h-16">
          {/* 로고 */}
          <Link to="/jungsi" className="flex shrink-0 items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-auto w-10 lg:w-12" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-white lg:text-lg">
                2026 정시
              </span>
              <span className="text-[10px] text-slate-400 lg:text-xs">
                G Skool
              </span>
            </div>
          </Link>

          {/* 모바일 메뉴 */}
          <span className="flex lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu
                  className="flex h-5 w-5 text-white lg:hidden"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent
                side={"left"}
                className="w-[300px] overflow-y-auto bg-slate-900 text-white sm:w-[400px]"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3 text-white">
                    <img
                      src="/logo.png"
                      alt="logo"
                      className="h-auto w-10 lg:w-12"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-base font-bold">2026 정시</span>
                      <span className="text-xs text-slate-400">G Skool</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col items-start justify-center gap-2">
                  {/* 전체 서비스로 돌아가기 */}
                  <Link
                    to="/"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "mb-4 w-full justify-start gap-2 border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    전체 서비스로 돌아가기
                  </Link>

                  <Separator className="mb-2 bg-slate-700" />

                  {/* 정시 서비스 메뉴 */}
                  <Link
                    to="/jungsi"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start px-1 text-white hover:bg-slate-800",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    🏠 정시 홈
                  </Link>
                  <Link
                    to="/jungsi/guide"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start px-1 text-white hover:bg-slate-800",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    📖 사용 안내
                  </Link>

                  <div className="w-full space-y-1">
                    <div className="px-1 py-2 text-sm font-semibold text-slate-400">
                      서비스 이용 순서
                    </div>
                    <Link
                      to="/jungsi/score-input"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start gap-2 px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                        1
                      </span>
                      📝 성적 입력
                    </Link>
                    <Link
                      to="/jungsi/score-analysis"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start gap-2 px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                        2
                      </span>
                      📊 성적분석
                    </Link>
                    <Link
                      to="/jungsi/strategy"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start gap-2 px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                        3
                      </span>
                      👻 지원전략
                    </Link>
                  </div>

                  <Separator className="my-2 bg-slate-700" />

                  <div className="w-full space-y-1">
                    <div className="px-1 py-2 text-sm font-semibold text-slate-400">
                      군별 컨설팅
                    </div>
                    <Link
                      to="/jungsi/a"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      🐢 가군 컨설팅
                    </Link>
                    <Link
                      to="/jungsi/b"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      🐢 나군 컨설팅
                    </Link>
                    <Link
                      to="/jungsi/c"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      🐢 다군 컨설팅
                    </Link>
                    <Link
                      to="/jungsi/gunoe"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      🐢 군외 컨설팅
                    </Link>
                  </div>

                  <Separator className="my-2 bg-slate-700" />

                  <div className="w-full space-y-1">
                    <div className="px-1 py-2 text-sm font-semibold text-slate-400">
                      지원 관리
                    </div>
                    <Link
                      to="/jungsi/interest"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      🏫 관심대학
                    </Link>
                    <Link
                      to="/jungsi/combination"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      🎯 모의지원
                    </Link>
                  </div>

                  <Separator className="my-2 bg-slate-700" />

                  {/* 사용자 메뉴 */}
                  <div className="w-full space-y-2">
                    <Link
                      to="/products"
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start px-1 text-white hover:bg-slate-800",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      🔥 이용권 구매
                    </Link>
                    {user ? (
                      <>
                        <Link
                          to="/users/profile"
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "w-full justify-start px-1 text-white hover:bg-slate-800",
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          마이 페이지
                        </Link>
                        <Link
                          to="/users/mock-exam"
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "w-full justify-start px-1 text-white hover:bg-slate-800",
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          모의고사/수능 성적 입력
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleLogoutClick();
                            setIsOpen(false);
                          }}
                          className={cn(
                            "w-full justify-start px-1 text-red-400 hover:bg-slate-800 hover:text-red-400",
                          )}
                        >
                          로그아웃
                        </Button>
                      </>
                    ) : (
                      <Link
                        to="/auth/login"
                        className={cn(
                          buttonVariants({ variant: "default" }),
                          "w-full bg-amber-500 hover:bg-amber-600",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        로그인
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* 데스크탑 메뉴 */}
          <div className="hidden items-center gap-8 lg:flex xl:gap-12">
            <NavigationMenu>
              <NavigationMenuList>
                {/* 전체 서비스로 돌아가기 */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "gap-2 bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white",
                    )}
                    asChild
                  >
                    <Link to="/">
                      <ArrowLeft className="h-4 w-4" />
                      전체 서비스
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-white hover:bg-slate-700 hover:text-white",
                    )}
                    asChild
                  >
                    <Link to="/jungsi">정시 홈</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* 사용 안내 */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-white hover:bg-slate-700 hover:text-white",
                    )}
                    asChild
                  >
                    <Link to="/jungsi/guide">사용 안내</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* 성적 관리 */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="bg-transparent text-white hover:bg-slate-700 hover:text-white data-[state=open]:bg-slate-700"
                    onPointerMove={(e: any) => e.preventDefault()}
                    onPointerLeave={(e: any) => e.preventDefault()}
                  >
                    성적 관리
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 md:w-[400px]">
                      <div className="flex flex-col gap-2">
                        <Link
                          to="/jungsi/score-input"
                          className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                            1
                          </span>
                          <div>
                            <div className="text-sm font-medium">📝 성적 입력</div>
                            <div className="text-xs text-muted-foreground">
                              수능/모의고사 성적을 입력합니다
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/jungsi/score-analysis"
                          className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                            2
                          </span>
                          <div>
                            <div className="text-sm font-medium">📊 성적분석</div>
                            <div className="text-xs text-muted-foreground">
                              입력된 성적을 분석합니다
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/jungsi/strategy"
                          className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                            3
                          </span>
                          <div>
                            <div className="text-sm font-medium">👻 지원전략</div>
                            <div className="text-xs text-muted-foreground">
                              수시/정시 지원 전략을 확인합니다
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* 군별 컨설팅 */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="bg-transparent text-white hover:bg-slate-700 hover:text-white data-[state=open]:bg-slate-700"
                    onPointerMove={(e: any) => e.preventDefault()}
                    onPointerLeave={(e: any) => e.preventDefault()}
                  >
                    군별 컨설팅
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 md:w-[350px]">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/jungsi/a"
                          className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">🐢 가군 컨설팅</span>
                        </Link>
                        <Link
                          to="/jungsi/b"
                          className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">🐢 나군 컨설팅</span>
                        </Link>
                        <Link
                          to="/jungsi/c"
                          className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">🐢 다군 컨설팅</span>
                        </Link>
                        <Link
                          to="/jungsi/gunoe"
                          className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">🐢 군외 컨설팅</span>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* 지원 관리 */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="bg-transparent text-white hover:bg-slate-700 hover:text-white data-[state=open]:bg-slate-700"
                    onPointerMove={(e: any) => e.preventDefault()}
                    onPointerLeave={(e: any) => e.preventDefault()}
                  >
                    지원 관리
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 md:w-[300px]">
                      <div className="flex flex-col gap-2">
                        <Link
                          to="/jungsi/interest"
                          className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">🏫 관심대학</span>
                        </Link>
                        <Link
                          to="/jungsi/combination"
                          className="flex items-center gap-2 rounded-lg px-3 py-3 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">🎯 모의지원</span>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* 우측 메뉴 */}
            <div className="flex items-center gap-2">
              <Link
                to="/products"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "px-3 py-1 text-sm text-amber-400 hover:bg-slate-700 hover:text-amber-300",
                )}
              >
                🔥 이용권 구매
              </Link>

              {user ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"ghost"}
                      className="text-white hover:bg-slate-700 hover:text-white"
                    >
                      <span>{user.nickname} 님</span>{" "}
                      <IconChevronDown className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 space-y-1 p-1">
                    <Link
                      to="/users/profile"
                      className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100"
                    >
                      마이 페이지
                    </Link>
                    <Link
                      to="/users/mock-exam"
                      className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100"
                    >
                      모의고사/수능 성적 입력
                    </Link>
                    <Link
                      to="/users/payment"
                      className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100"
                    >
                      결제내역
                    </Link>
                    <Separator />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant={"ghost"}
                          className="flex h-8 w-full items-center justify-start rounded-md px-2 text-sm font-normal text-red-500 hover:bg-gray-100 hover:text-red-500"
                        >
                          로그아웃
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-full max-w-[300px]">
                        <DialogHeader>
                          <DialogTitle>로그아웃 하시겠습니까?</DialogTitle>
                        </DialogHeader>
                        <DialogFooter className="gap-4">
                          <DialogClose>취소</DialogClose>
                          <Button onClick={handleLogoutClick}>확인</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link
                  to="/auth/login"
                  className={cn(
                    buttonVariants(),
                    "bg-amber-500 hover:bg-amber-600",
                  )}
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
`;

fs.writeFileSync('src/components/jungsi-header.tsx', jungsiHeaderContent, 'utf8');
console.log('Jungsi header updated with guide menu!');
