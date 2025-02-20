'use client';

import { useEffect, useState } from "react";
import { FastRender } from "fastrender";
import 'katex/dist/katex.min.css';

const scienceContent = `
# Physics Fundamentals

## Special Relativity

Einstein's famous mass-energy equivalence:

\\[ E = mc^2 \\]

The Lorentz transformation equations:

\\[
\\begin{aligned}
t' &= \\gamma\\left(t - \\frac{vx}{c^2}\\right) \\\\
x' &= \\gamma(x - vt) \\\\
y' &= y \\\\
z' &= z
\\end{aligned}
\\]

where \\( \\gamma = \\frac{1}{\\sqrt{1-\\frac{v^2}{c^2}}} \\) is the Lorentz factor.

## General Relativity

Einstein's field equations:

\\[ G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu} \\]

The Schwarzschild metric:

\\[ ds^2 = -\\left(1-\\frac{2GM}{rc^2}\\right)dt^2 + \\left(1-\\frac{2GM}{rc^2}\\right)^{-1}dr^2 + r^2(d\\theta^2 + \\sin^2\\theta d\\phi^2) \\]

## Quantum Mechanics

The time-dependent Schrödinger equation:

\\[ i\\hbar \\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t) \\]

Heisenberg's uncertainty principle:

\\[ \\Delta x \\Delta p \\geq \\frac{\\hbar}{2} \\]

The quantum harmonic oscillator energy levels:

\\[ E_n = \\hbar\\omega\\left(n + \\frac{1}{2}\\right) \\]

## Electromagnetism

Maxwell's equations in differential form:

\\[
\\begin{aligned}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\epsilon_0} \\\\
\\nabla \\cdot \\mathbf{B} &= 0 \\\\
\\nabla \\times \\mathbf{E} &= -\\frac{\\partial\\mathbf{B}}{\\partial t} \\\\
\\nabla \\times \\mathbf{B} &= \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial\\mathbf{E}}{\\partial t}
\\end{aligned}
\\]

## Statistical Mechanics

The Boltzmann distribution:

\\[ P(E) = \\frac{1}{Z}e^{-\\beta E} \\]

where \\( \\beta = \\frac{1}{k_B T} \\) and \\( Z \\) is the partition function.

The entropy formula:

\\[ S = k_B \\ln W \\]

## Vector Calculus

For a vector field \\(\\mathbf{F}\\), the fundamental operations are:

Divergence:
\\[ \\nabla \\cdot \\mathbf{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z} \\]

Curl:
\\[ \\nabla \\times \\mathbf{F} = \\begin{pmatrix}
\\frac{\\partial F_z}{\\partial y} - \\frac{\\partial F_y}{\\partial z} \\\\
\\frac{\\partial F_x}{\\partial z} - \\frac{\\partial F_z}{\\partial x} \\\\
\\frac{\\partial F_y}{\\partial x} - \\frac{\\partial F_x}{\\partial y}
\\end{pmatrix} \\]

Gradient:
\\[ \\nabla f = \\begin{pmatrix}
\\frac{\\partial f}{\\partial x} \\\\
\\frac{\\partial f}{\\partial y} \\\\
\\frac{\\partial f}{\\partial z}
\\end{pmatrix} \\]
`;

export default function SciencePage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderer = new FastRender({
      debug: false,
      katexOptions: {
        throwOnError: false,
        trust: true,
        strict: false,
        macros: {
          '\\E': '\\mathrm{E}',
          '\\mc': '\\mathrm{mc}',
          '\\grad': '\\nabla',
          '\\div': '\\nabla \\cdot',
          '\\curl': '\\nabla \\times'
        }
      }
    });

    const renderContent = async () => {
      try {
        await renderer.initialize();
        const rendered = await renderer.renderMixed(scienceContent);
        setContent(rendered);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    renderContent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Physics Equations</h1>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
    </div>
  );
}