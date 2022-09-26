{
  description = "A very basic flake";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }: let
    pkgs = import nixpkgs { system = "x86_64-linux"; };
  in {

    packages.x86_64-linux.website = let
      nodeEnv = import ./study/node-env.nix {
        inherit (pkgs) stdenv lib python2 runCommand writeTextFile writeShellScript;
        inherit pkgs nodejs;
        libtool = if pkgs.stdenv.isDarwin then pkgs.darwin.cctools else null;
      };
    in
    import ./study/node-packages.nix {
      inherit (pkgs) fetchurl nix-gitignore stdenv lib fetchgit;
      inherit nodeEnv;
    };

    defaultPackage.x86_64-linux = self.packages.x86_64-linux.website;

  };
}
