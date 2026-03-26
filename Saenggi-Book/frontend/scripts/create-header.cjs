const fs = require('fs');

const headerContent = `import { IconChevronDown } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button, buttonVariants } from "./custom/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
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
import { Menu } from "lucide-react";
import { clearTokens as clearTokenManager } from "@/lib/api/token-manager";
import { useTokenStore } from "@/stores/atoms/tokens";

export const Header = () => {
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

  const { data: isOfficer } = useQuery({
    queryKey: ["officer", "check"],
    queryFn: () => USER_API.fetchCurrentUserAPI().then(user => user?.role === "officer" || false),
    enabled: !isAuthPage && !!user,
    retry: false,
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
    <header className="sticky top-0 z-40 w-full border-b-[1px] bg-white">
      <div className="mx-auto">
        <div className="container flex h-14 w-screen items-center justify-between lg:h-16">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-auto w-10 lg:w-12" />
            <div className="text-base font-medium text-primary lg:text-lg">G Skool</div>
          </Link>

          <span className="flex lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu className="flex h-5 w-5 lg:hidden" onClick={() => setIsOpen(true)}>
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <img src="/logo.png" alt="logo" className="h-auto w-10 lg:w-12" />
                    <div className="text-base font-medium text-primary lg:text-lg">G Skool</div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col items-start justify-center gap-4">
                  <Link to="/" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>🏠 홈</Link>
                  <Separator className="my-2" />
                  <div className="w-full space-y-2">
                    <div className="font-semibold text-sm text-gray-500 px-1">고객센터</div>
                    <Link to="/official/notice" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>공지사항</Link>
                    <Link to="/official/guide" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>서비스 소개</Link>
                    <Link to="/official/faq" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>FAQ</Link>
                  </div>
                  <Separator className="my-2" />
                  <div className="w-full space-y-2">
                    <Link to="/products" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>🔥 이용권 구매</Link>
                    {user ? (
                      <>
                        <Link to="/users/profile" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>마이 페이지</Link>
                        <Link to="/users/school-record" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>생기부/성적 입력</Link>
                        <Link to="/users/mock-exam" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>모의고사/수능 성적 입력</Link>
                        {isOfficer && <Link to="/officer/apply" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start px-1")} onClick={() => setIsOpen(false)}>평가자 전용 페이지</Link>}
                        <Button variant="ghost" onClick={() => { handleLogoutClick(); setIsOpen(false); }} className="w-full justify-start px-1 text-red-500 hover:text-red-600">로그아웃</Button>
                      </>
                    ) : (
                      <Link to="/auth/login" className={cn(buttonVariants({ variant: "default" }), "w-full")} onClick={() => setIsOpen(false)}>로그인</Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          <div className="hidden items-center gap-4 lg:flex">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost"><span>고객센터</span><IconChevronDown className="size-4" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 space-y-1 p-1">
                <Link to="/official/notice" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">공지사항</Link>
                <Link to="/official/guide" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">서비스 소개</Link>
                <Link to="/official/faq" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">FAQ</Link>
              </PopoverContent>
            </Popover>
            <Link to="/products" className={cn(buttonVariants({ variant: "ghost" }), "px-3 py-1 text-sm")}>🔥 이용권 구매</Link>
            {user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost"><span>{user.nickname} 님</span> <IconChevronDown className="size-4" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 space-y-1 p-1">
                  <Link to="/users/profile" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">마이 페이지</Link>
                  <Link to="/users/school-record" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">생기부/성적 입력</Link>
                  <Link to="/users/mock-exam" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">모의고사/수능 성적 입력</Link>
                  <Link to="/users/payment" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">결제내역</Link>
                  {isOfficer && <Link to="/officer/apply" className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-gray-100">평가자 전용 페이지</Link>}
                  <Separator />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="flex h-8 w-full items-center justify-start rounded-md px-2 text-sm font-normal text-red-500 hover:bg-gray-100 hover:text-red-500">로그아웃</Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-[300px]">
                      <DialogHeader><DialogTitle>로그아웃 하시겠습니까?</DialogTitle></DialogHeader>
                      <DialogFooter className="gap-4"><DialogClose>취소</DialogClose><Button onClick={handleLogoutClick}>확인</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </PopoverContent>
              </Popover>
            ) : (
              <Link to="/auth/login" className={cn(buttonVariants())}>로그인</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
`;

fs.writeFileSync('src/components/header.tsx', headerContent, 'utf8');
console.log('Header written successfully!');
