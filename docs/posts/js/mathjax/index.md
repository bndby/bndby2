---
date: 2026-01-16
description: 'MathJax basic tutorial and quick reference'
tags:
    - MathJax
categories:
    - JS
slug: mathjax
---

# MathJax basic tutorial and quick reference

To see how any formula was written in any question or answer, including this one, right-click on the expression and choose "Show Math As > TeX Commands". (When you do this, the '$' will not display. Make sure you add these: see the next point. There are also other ways to view the code for the formula or the whole post.)

<!-- more -->

To try formatting, visit the formatting sandbox post, select one of the answers that says “free for editing” and use the “edit” button to edit the answer however you like. Don't forget to change it back when you are finished, so it can be used again.

1.  **For inline formulas, enclose the formula in `$…$`. For displayed formulas, use `$$…$$`.**
    - These render differently. For example, type the following to show inline mode: $\sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}$

    - or type the following for display mode:

        $$\sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}$$

2.  For **Greek letters**, use `\alpha`, `\beta`, …, `\omega`: $\alpha$, $\beta$, …, $\omega$.
    - For uppercase letters, use `\Gamma`, `\Delta`, …, `\Omega`: $\Gamma$, $\Delta$, …, $\Omega$.

    - Other Greek capital letters are the same as the Latin ones: `A`, `B`, `E`, `Z` and so on: $A$, $B$, $E$, $Z$ ….

    - Some Greek letters have variant forms: `\epsilon` `\varepsilon` $\epsilon$, $\varepsilon$, `\phi` `\varphi` $\phi$, $\varphi$, and others.

3.  For **superscripts and subscripts**, use `^` and `_`. For example, `x_i^2`: $x_i^2$, `\log_2 x`: $\log_2 x$. For the **prime** symbol, use an apostrophe `x'` `x''` `x'''`: $x' x'' x'''$.

4.  **Groups**. Superscripts, subscripts, and other operations apply only to the next “group”. A “group” is either a single symbol, or any formula surrounded by curly braces `{…}`.
    - If you do `10^10`, you will get a surprise: $10^10$. But `10^{10}` gives what you probably wanted: $10^{10}$.
    - Use curly braces to delimit a formula to which a superscript or subscript applies: `x^y^z` is an error; `{x^y}^z` is ${x^y}^z$, and `x^{y^z}` is $x^{y^z}$. Observe the differences between `x_i^2` $x_i^2$, `x_{i^2}` $x_{i^2}$ and `{x_i}^2` ${x_i}^2$.

5.  **Parentheses**. Ordinary symbols `()[]` make parentheses and brackets $(2+3)[4+4]$. Use `\{` and `\}` for curly braces $\{\}$.
    - These do _not_ scale with the formula in between, so if you write `(\frac{\sqrt x}{y^3})` the parentheses will be too small: $(\frac{\sqrt x}{y^3})$. Using `\left(…\right)` will make the sizes adjust automatically to the formula they enclose: `\left(\frac{\sqrt x}{y^3}\right)` is $\left(\frac{\sqrt x}{y^3}\right)$.

    - `\left` and `\right` apply to all the following sorts of parentheses: `(` and `)` $(x)$, `[` and `]` $[x]$, `\{` and `\}` ${x}$, `|` $|x|$, `\vert` $\vert x \vert$, `\Vert` $\Vert x \Vert$, `\langle` and `\rangle` $\langle x \rangle$, `\lceil` and `\rceil` $\lceil x \rceil$, and `\lfloor` and `\rfloor` $\lfloor x \rfloor$. `\middle` can be used to add additional dividers. There are also invisible parentheses, denoted by `.`: use `\left.x^2\right\rvert_3^5 = 5^2-3^2` to get

    $$\left.x^2\right\rvert_3^5 = 5^2-3^2$$

6.  **Sums and integrals**. `\sum` and `\int`; the subscript is the lower limit and the superscript is the upper limit, so for example `\sum_1^n` $\sum_1^n$. Don't forget `{…}` if the limits are more than a single symbol. For example, `\sum_{i=0}^\infty i^2` is $\sum_{i=0}^\infty i^2$.
    - Similarly, `\prod` $\prod$, `\int` $\int$, `\bigcup` $\bigcup$, `\bigcap` $\bigcap$, `\iint` $\iint$, `\iiint` $\iiint$, `\idotsint` $\idotsint$.

7.  **Fractions**. There are three ways to make fractions. `\frac ab` applies to the next two groups, and produces $\frac ab$; for more complicated numerators and denominators use `{…}`: `\frac{a+1}{b+1}` is $\frac{a+1}{b+1}$.
    - If the numerator and denominator are complicated, you may prefer `\over`, which splits up the group that it is in: `{a+1\over b+1}` is ${a+1\over b+1}$.

    - For continued fractions, use `\cfrac` instead of `\frac`.

8.  **Fonts**
    - Use `\mathbb` or `\Bbb` for "blackboard bold": $\Bbb{CHNQRZ}$.

    - Use `\mathbf` for boldface: $\mathbf{CHNQRZ chnqrz}$.
        - For expression based characters, use `\boldsymbol` instead: $\boldsymbol\alpha$

    - Use `\mathit` for italics: $\mathit{CHNQRZ chnqrz}$.

    - Use `\pmb` for boldfaced italics: $\pmb{CHNQRZCHNQRZ chnqrzchnqrz}$.

    - Use `\mathtt` for "typewriter" font: $\mathtt{CHNQRZ chnqrz}$.

    - Use `\mathrm` for roman font: $\mathrm{CHNQRZ chnqrz}$.

    - Use `\mathsf` for sans-serif font: $\mathsf{CHNQRZ chnqrz}$.

    - Use `\mathcal` for "calligraphic" letters: $\mathcal{CHNQRZ}$ (Uppercase only.)

    - Use `\mathscr` for script letters: $\mathscr{CHNQRZ chnqrz}$.

    - Use `\mathfrak` for "Fraktur" (old German style) letters: $\mathfrak{CHNQRZ chnqrz}$.

9.  **Radical signs / roots**. Use `sqrt`, which adjusts to the size of its argument: `\sqrt{x^3}` $\sqrt{x^3}$; `\sqrt[3]{\frac xy}` $\sqrt[3]{\frac xy}$. For complicated expressions, consider using `{...}^{1/2}` instead.

10. Some **special functions** such as "lim", "sin", "max", "ln", and so on are normally set in roman font instead of italic font. Use `\lim`, `\sin`, etc. to make these: `\sin x` $\sin x$, not `sin x` $sin x$. Use subscripts to attach a notation to `\lim`: `\lim_{x\to 0}`

    $$\lim_{x\to 0}$$

    Nonstandard function names can be set with `\operatorname{foo}(x)` $\operatorname{foo}(x)$.

11. There are a very large number of **special symbols and notations**, too many to list here; see the short listing [LATEX and AMS-LATEX Symbols](https://pic.plover.com/MISC/symbols.pdf) prepared by Dr. Emre Sermutlu, or the exhaustive listing [The Comprehensive LATEX Symbol List](/docs/js/mathjax/symbols-a4.pdf) by Scott Pakin. Some of the most common include:
    - `\lt` `\gt` `\le` `\ge` `\neq` $\lt$, $\gt$, $\le$, $\ge$, $\neq$. You can use `\not` to put a slash through almost anything: `\not\lt` $\not\lt$ but it often looks bad.
    - `\times` `\div` `\pm` `\mp` $\times$, $\div$, $\pm$, $\mp$. `\cdot` is a centered dot: $x \cdot y$
    - `\cup` `\cap` `\setminus` `\subset` `\subseteq` `\subsetneq` `\supset` `\in` `\notin` `\emptyset` `\varnothing` $\cup$, $\cap$, $\setminus$, $\subset$, $\subseteq$, $\subsetneq$, $\supset$, $\in$, $\notin$, $\emptyset$, $\varnothing$
    - `{n+1 \choose 2k}` or `\binom{n+1}{2k}` $\binom{n+1}{2k}$
    - `\to` `\gets` `\rightarrow` `\leftarrow` `\Rightarrow` `\Leftarrow` `\mapsto` `\implies` `\iff` $\to$, $\gets$,$\rightarrow$, $\leftarrow$, $\Rightarrow$, $\Leftarrow$, $\mapsto$, $\implies$, $\iff$
    - `\land` `\lor` `\lnot` `\forall` `\exists` `\top` `\bot` `\vdash` `\vDash` $\land$, $\lor$, $\lnot$, $\forall$, $\exists$, $\top$, $\bot$, $\vdash$, $\vDash$
    - `\star` `\ast` `\oplus` `\circ` `\bullet` $\star$, $\ast$, $\oplus$, $\circ$, $\bullet$
    - `\approx` `\sim` `\simeq` `\cong` `\equiv` `\prec` `\lhd` $\approx$, $\sim$, $\simeq$, $\cong$, $\equiv$, $\prec$, $\lhd$
    - `\infty` `\aleph_0` $\infty$, $\aleph_0$ `\nabla` `\partial` $\nabla$, $\partial$ `\Im` `\Re` $\Im$, $\Re$
    - For modular equivalence, use `\pmod` like this: `a\equiv b\pmod n` $a\equiv b\pmod n$. For the binary mod operator, use `\bmod` like this: `a\bmod 17` $a\bmod 17$.
    - Use `\dots` for the triple dots in $a_1, a_2, \dots, a_n$ and $a_1 + a_2 + \dots + a_n$
    - Script lowercase l is `\ell` $\ell$.

    Detexify lets you draw a symbol on a web page and then lists the TEX symbols that seem to resemble it. These are not guaranteed to work in MathJax, but it's a good place to start. To check that a command is supported, note that MathJax.org maintains a list of currently supported LATEX commands, and one can also check Dr. Carol JVF Burns's page of TEX Commands Available in MathJax.

12. **Spaces**. MathJax usually decides for itself how to space formulas, using a complex set of rules. Putting extra literal spaces into formulas will not change the amount of space MathJax puts in: `a␣b` and `a␣␣␣␣b` are both $a b$. To add more space, use `\,` for a thin space $a\,b$; `\;` for a wider space $a\;b$. `\quad` and `\qquad` are large spaces: $a \quad b$, $a \qquad b$.

    To set plain text, use `\text{…}`: $\{x\in s\mid x\text{ is extra large}\}$. You can nest `$…$` inside of `\text{…}`, for example to access spaces.

13. **Accents and diacritical marks**. Use `\hat` for a single symbol $\hat{x}$, `\widehat` for a larger formula $\widehat{xy}$. If you make it too wide, it will look silly. Similarly, there are `\bar` $\bar{x}$ and `\overline` $\overline{xyz}$, and `\vec` $\vec{x}$ and `\overrightarrow` $\overrightarrow{xy}$ and `\overleftrightarrow` $\overleftrightarrow{xy}$. For dots, as in $\frac d{dx}x\dot x =  \dot x^2 +  x\ddot x$, use `\dot` and `\ddot`.

14. Special characters used for MathJax interpreting can be escaped using the `\` character: `\$` $\$$, `\{` $\{$, `\}` $\}$, `\_` $\_$, `\#` $\#$, `\&` $\&$. If you want `\` itself, you should use `\backslash` (symbol) or `\setminus` (binary operation) for $\setminus$, because `\\` is for a new line.

<small>Источник: <https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference></small>
