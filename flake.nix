{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachSystem
      [ "x86_64-linux" "aarch64-linux" ]
      (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          nodejs = pkgs."nodejs-18_x";
        in
        {

          packages = {

            default = self.packages.${system}.website;
            website =
              let
                nodeEnv = import ./study/node-env.nix {
                  inherit (pkgs) stdenv lib python2 runCommand writeTextFile writeShellScript;
                  inherit pkgs nodejs;
                  libtool = if pkgs.stdenv.isDarwin then pkgs.darwin.cctools else null;
                };
              in
              (import ./study/node-packages.nix {
                inherit (pkgs) fetchurl nix-gitignore stdenv lib fetchgit;
                inherit nodeEnv;
              }).package.override {
                postInstall = ''
                  npm run build
                '';
              };
          };

          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs
              node2nix
            ];
          };

        });
}
