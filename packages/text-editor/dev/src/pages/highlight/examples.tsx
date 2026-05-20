const baseExamples = [
  {
    code: `
<template>
  <div>
    <h1>Hello World</h1>
  </div>
</template>
`,
    path: 'a.vue',
  },
  {
    code: `
import React from 'react';

function App() {
  return (
    <>
      <div
        a="sdf"
      >
        <h1>Hello World</h1>
        {/* hello() */}
      </div>
      <a
        href="https://www.baidu.com"
      />
    </>
  );
}

export default App;
`,
    path: 'a.tsx',
  },
  {
    code: `import React from 'react';

function App() {
  return (
    <div>
      {/* hello() */}
      <h1>Hello World</h1>
    </div>
  );
}

export default App;
`,
    path: 'a.jsx',
  },
  {
    code: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
  <!-- hello() -->
</body>
</html>
`,
    path: 'a.html',
  },
  {
    code: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>
`,
    path: 'a.svg',
  },
  {
    code: `
body {
  background-color: #f0f0f0;
}
`,
    path: 'a.scss',
  },
  {
    code: `
{
  "name": "John Doe",
  "age": 30,
  "city": "New York"
}
`,
    path: 'a.json',
  },
  {
    code: `
## Markdown Example

This is a markdown example.
`,
    path: 'a.md',
  },
  {
    code: 'const a = (1);',
    path: 'a.js',
  },
  {
    code: 'const b = 2;',
    path: 'b.ts',
  },
  {
    code: `#!/bin/bash
echo 'hello world'
`,
    path: 'c.sh',
  },
  {
    code: `
-- d.sql
SELECT * FROM table;
`,
    path: 'd.sql',
  },
  {
    code: `
/* e.css */
body {
  background-color: #f0f0f0;
}
`,
    path: 'e.css',
  },
  {
    code: `
def main():
    print('hello world')

if __name__ == '__main__':
    main()
`,
    path: 'f.py',
  },
  {
    code: `package main

import "fmt"

func sayHello() {
  fmt.Println("Hello, World!")
}

func main() {
  sayHello()
}
`,
    path: 'g.go',
  },
];

const missingExamples = [
  {
    code: `
body
  color: #333
  font-family: sans-serif
`,
    path: 'a.sass',
  },
  {
    code: `
@primary: #4d90fe;

.card {
  color: @primary;
}
`,
    path: 'a.less',
  },
  {
    code: `(module
  (func (export "add") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add))`,
    path: 'a.wat',
  },
  {
    code: `#include <iostream>

int main() {
  std::cout << "Hello, C++" << std::endl;
  return 0;
}
`,
    path: 'a.cpp',
  },
  {
    code: `#include <stdio.h>

int main(void) {
  printf("Hello, C\\n");
  return 0;
}
`,
    path: 'a.c',
  },
  {
    code: `fn main() {
  println!("Hello, Rust!");
}
`,
    path: 'a.rs',
  },
  {
    code: `<?php
function greet(string $name): string {
  return "Hello, {$name}!";
}

echo greet('PHP');
`,
    path: 'a.php',
  },
  {
    code: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, Java");
  }
}
`,
    path: 'a.java',
  },
  {
    code: `
name: demo
version: 1
items:
  - one
  - two
`,
    path: 'a.yaml',
  },
  {
    code: `
<root>
  <message>Hello XML</message>
</root>
`,
    path: 'a.xml',
  },
  {
    code: "sum←+/1 2 3\n⎕←sum\n",
    path: 'a.apl',
  },
  {
    code: `-----BEGIN PGP MESSAGE-----
Version: Demo

SGVsbG8=
-----END PGP MESSAGE-----
`,
    path: 'a.pgp',
  },
  {
    code: `Demo DEFINITIONS ::= BEGIN
Message ::= IA5String
END
`,
    path: 'a.asn',
  },
  {
    code: `
[default]
static = yes
writeprotect = no
`,
    path: 'extensions.conf',
  },
  {
    code: '+++++[>++++++++<-]>+.+.',
    path: 'a.bf',
  },
  {
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO.
       PROCEDURE DIVISION.
           DISPLAY "HELLO COBOL".
           STOP RUN.
`,
    path: 'a.cob',
  },
  {
    code: `using System;

class Program {
  static void Main() {
    Console.WriteLine("Hello, C#");
  }
}
`,
    path: 'a.cs',
  },
  {
    code: `(ns demo.core)

(defn greet [name]
  (str "Hello, " name))
`,
    path: 'a.clj',
  },
  {
    code: `(ns demo.core)

(defn square [n]
  (* n n))
`,
    path: 'a.cljs',
  },
  {
    code: `
@def color primary #0f62fe;

.button {
  color: value(primary);
}
`,
    path: 'a.gss',
  },
  {
    code: `cmake_minimum_required(VERSION 3.20)
project(Demo)
add_executable(demo main.cpp)
`,
    path: 'CMakeLists.txt',
  },
  {
    code: `square = (n) -> n * n
console.log square(4)
`,
    path: 'a.coffee',
  },
  {
    code: `(defun greet (name)
  (format t "Hello, ~A~%" name))
`,
    path: 'a.cl',
  },
  {
    code: `MATCH (n:Person)
RETURN n.name
`,
    path: 'a.cypher',
  },
  {
    code: `cpdef int add(int a, int b):
    return a + b
`,
    path: 'a.pyx',
  },
  {
    code: `puts "Hello from Crystal"
`,
    path: 'a.cr',
  },
  {
    code: `import std.stdio;

void main() {
  writeln("Hello, D");
}
`,
    path: 'a.d',
  },
  {
    code: `void main() {
  print('Hello, Dart');
}
`,
    path: 'a.dart',
  },
  {
    code: `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-old
+new
`,
    path: 'a.diff',
  },
  {
    code: `FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
`,
    path: 'Dockerfile',
  },
  {
    code: `<!ELEMENT note (to,from,body)>
<!ELEMENT to (#PCDATA)>
<!ELEMENT from (#PCDATA)>
<!ELEMENT body (#PCDATA)>
`,
    path: 'a.dtd',
  },
  {
    code: `define method greet(name)
  format-out("Hello, %s", name);
end method;
`,
    path: 'a.dylan',
  },
  {
    code: `EXPORT Hello := 'world';
OUTPUT(Hello);
`,
    path: 'a.ecl',
  },
  {
    code: `{:name "demo"
 :enabled true}
`,
    path: 'a.edn',
  },
  {
    code: `class HELLO
create make
feature
  make
    do
      print ("Hello Eiffel%N")
    end
end
`,
    path: 'a.e',
  },
  {
    code: `module Main exposing (main)

import Html exposing (text)

main =
  text "Hello, Elm"
`,
    path: 'a.elm',
  },
  {
    code: `-module(demo).
-export([hello/0]).

hello() ->
  io:format("Hello, Erlang~n").
`,
    path: 'a.erl',
  },
  {
    code: `USING: io ;
"Hello, Factor" print
`,
    path: 'a.factor',
  },
  {
    code: `: greet ( -- )
  ." Hello, Forth" ;
`,
    path: 'a.forth',
  },
  {
    code: `program hello
  print *, "Hello, Fortran"
end program hello
`,
    path: 'a.f90',
  },
  {
    code: `let add a b = a + b
printfn "%d" (add 1 2)
`,
    path: 'a.fs',
  },
  {
    code: `.global _start
_start:
  mov $60, %rax
  xor %rdi, %rdi
  syscall
`,
    path: 'a.s',
  },
  {
    code: `Feature: Greeting
  Scenario: Say hello
    Given a user opens the app
`,
    path: 'a.feature',
  },
  {
    code: `class Main {
  static void main(String[] args) {
    println 'Hello, Groovy'
  }
}
`,
    path: 'a.groovy',
  },
  {
    code: `main :: IO ()
main = putStrLn "Hello, Haskell"
`,
    path: 'a.hs',
  },
  {
    code: `class Main {
  static function main() {
    trace('Hello, Haxe');
  }
}
`,
    path: 'a.hx',
  },
  {
    code: `-main Main
-js main.js
`,
    path: 'a.hxml',
  },
  {
    code: `pro greet
  print, 'Hello IDL'
end
`,
    path: 'a.pro',
  },
  {
    code: `{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "John Doe"
}
`,
    path: 'a.jsonld',
  },
  {
    code: `println("Hello, Julia")
`,
    path: 'a.jl',
  },
  {
    code: `fun main() {
  println("Hello, Kotlin")
}
`,
    path: 'a.kt',
  },
  {
    code: `square = (x) --> x * x
console.log square 3
`,
    path: 'a.ls',
  },
  {
    code: `local function greet(name)
  return 'Hello, ' .. name
end
`,
    path: 'a.lua',
  },
  {
    code: `alias greet {
  echo -a Hello mIRC
}
`,
    path: 'a.mrc',
  },
  {
    code: `Print["Hello, Mathematica"]
`,
    path: 'a.wl',
  },
  {
    code: `model Hello
  Real x;
end Hello;
`,
    path: 'a.mo',
  },
  {
    code: `WRITE "Hello MUMPS" !
QUIT
`,
    path: 'a.mps',
  },
  {
    code: `From demo@example.com Fri Jan 01 00:00:00 2024
Subject: Hello

Mailbox content
`,
    path: 'a.mbox',
  },
  {
    code: `server {
  listen 80;
  server_name example.com;
}
`,
    path: 'nginx.conf',
  },
  {
    code: `Name "Demo"
OutFile "demo.exe"
Section
SectionEnd
`,
    path: 'a.nsi',
  },
  {
    code: `<https://example.com/s> <https://example.com/p> "o" .
`,
    path: 'a.nt',
  },
  {
    code: `#import <Foundation/Foundation.h>

int main() {
  NSLog(@"Hello Objective-C++");
  return 0;
}
`,
    path: 'a.mm',
  },
  {
    code: `let greet name = print_endline ("Hello, " ^ name)
`,
    path: 'a.ml',
  },
  {
    code: `declare
  {Browse 'Hello Oz'}
end
`,
    path: 'a.oz',
  },
  {
    code: `program Hello;
begin
  writeln('Hello, Pascal');
end.
`,
    path: 'a.pas',
  },
  {
    code: `print "Hello, Perl\n";
`,
    path: 'a.pl',
  },
  {
    code: `A = LOAD 'input' USING PigStorage(',');
DUMP A;
`,
    path: 'a.pig',
  },
  {
    code: `Write-Output 'Hello, PowerShell'
`,
    path: 'a.ps1',
  },
  {
    code: `name=demo
enabled=true
`,
    path: 'a.ini',
  },
  {
    code: `syntax = "proto3";

message Hello {
  string name = 1;
}
`,
    path: 'a.proto',
  },
  {
    code: `div.card
  h1 Hello Pug
`,
    path: 'a.pug',
  },
  {
    code: `class demo {
  notify { 'hello puppet': }
}
`,
    path: 'a.pp',
  },
  {
    code: `show 1 + 2
`,
    path: 'a.q',
  },
  {
    code: `message <- 'Hello, R'
print(message)
`,
    path: 'a.r',
  },
  {
    code: `Name: demo
Version: 1.0.0
Release: 1
Summary: demo package
`,
    path: 'a.spec',
  },
  {
    code: `puts 'Hello, Ruby'
`,
    path: 'a.rb',
  },
  {
    code: `data demo;
  message = 'Hello SAS';
run;
`,
    path: 'a.sas',
  },
  {
    code: `object Main extends App {
  println("Hello, Scala")
}
`,
    path: 'a.scala',
  },
  {
    code: `(display "Hello, Scheme")
(newline)
`,
    path: 'a.scm',
  },
  {
    code: `require ["fileinto"];
fileinto "Archive";
`,
    path: 'a.siv',
  },
  {
    code: `Transcript show: 'Hello, Smalltalk'.
`,
    path: 'a.st',
  },
  {
    code: `signature GREETER =
sig
  val greet : string -> unit
end
`,
    path: 'a.sml',
  },
  {
    code: `SELECT * WHERE {
  ?s ?p ?o .
}
`,
    path: 'a.rq',
  },
  {
    code: `function main() {
  ::print("Hello, Squirrel")
}
`,
    path: 'a.nut',
  },
  {
    code: `body
  color #333
`,
    path: 'a.styl',
  },
  {
    code: `print("Hello, Swift")
`,
    path: 'a.swift',
  },
  {
    code: `\\documentclass{article}
\\begin{document}
Hello, LaTeX
\\end{document}
`,
    path: 'a.tex',
  },
  {
    code: `module demo;
  initial begin
    $display("Hello, SystemVerilog");
  end
endmodule
`,
    path: 'a.sv',
  },
  {
    code: `puts "Hello, Tcl"
`,
    path: 'a.tcl',
  },
  {
    code: `h1. Hello Textile
`,
    path: 'a.textile',
  },
  {
    code: `title = "demo"
[server]
port = 3000
`,
    path: 'a.toml',
  },
  {
    code: `.TH DEMO 1
.SH NAME
demo \\- hello world
`,
    path: 'a.1',
  },
  {
    code: `module Demo {
  testcase tc_demo() runs on MTC {}
}
`,
    path: 'a.ttcn',
  },
  {
    code: `[LOGGING]
LogFile := "demo.log"
`,
    path: 'a.cfg',
  },
  {
    code: `@prefix ex: <https://example.com/> .
ex:item ex:name "demo" .
`,
    path: 'a.ttl',
  },
  {
    code: `interface Demo {
  attribute DOMString name;
};
`,
    path: 'a.webidl',
  },
  {
    code: `Module Demo
  Sub Main()
    Console.WriteLine("Hello, VB.NET")
  End Sub
End Module
`,
    path: 'a.vb',
  },
  {
    code: `MsgBox "Hello, VBScript"
`,
    path: 'a.vbs',
  },
  {
    code: `#set($name = 'Velocity')
Hello, $name
`,
    path: 'a.vtl',
  },
  {
    code: `entity demo is
end entity;
`,
    path: 'a.vhd',
  },
  {
    code: `for $x in doc("demo.xml")/root/item
return $x
`,
    path: 'a.xq',
  },
  {
    code: `Echo("Hello, Yacas");
`,
    path: 'a.ys',
  },
  {
    code: `ld a, 1
halt
`,
    path: 'a.z80',
  },
  {
    code: `msc {
  a => b [ label = "hello" ];
}
`,
    path: 'a.mscgen',
  },
  {
    code: `xu {
  a -> b : hello;
}
`,
    path: 'a.xu',
  },
  {
    code: `msgenny {
  a => b [ label = "hello" ];
}
`,
    path: 'a.msgenny',
  },
];

export const examples = [...baseExamples, ...missingExamples];
