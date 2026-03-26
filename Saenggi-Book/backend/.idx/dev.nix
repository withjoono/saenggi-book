{ pkgs, ... }: {
  # nixpkgs 채널
  channel = "stable-23.11";

  # 프로젝트에 필요한 패키지 목록
  packages = [
    pkgs.nodejs_20
    pkgs.yarn
    pkgs.git
    pkgs.cacert
    pkgs.docker
    pkgs.docker-compose
    pkgs.google-cloud-sdk
  ];

  # VS Code 확장
  idx.extensions = [
    "ms-vsliveshare.vsliveshare"
    "dbaumer.vscode-eslint"
  ];

  # Docker 서비스 활성화
  services.docker.enable = true;
}
