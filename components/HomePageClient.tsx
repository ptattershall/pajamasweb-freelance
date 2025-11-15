'use client'

import Image from "next/image";
import Link from "next/link";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function HomePageClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const offerings = [
    {
      title: "Web Development",
      description: "Custom websites and web applications built with modern technologies.",
      icon: "🚀",
    },
    {
      title: "UI/UX Design",
      description: "Beautiful, user-centered designs that convert and delight.",
      icon: "🎨",
    },
    {
      title: "Consulting",
      description: "Strategic guidance to help you make the right technical decisions.",
      icon: "💡",
    },
    {
      title: "Maintenance & Support",
      description: "Ongoing support to keep your projects running smoothly.",
      icon: "🔧",
    },
  ];

  const socialLinks = [
    { name: "GitHub", url: "#" },
    { name: "LinkedIn", url: "#" },
    { name: "Twitter", url: "#" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/PajamasWebCloud.png"
              alt="PajamasWeb Logo"
              width={40}
              height={40}
              className="dark:hidden"
            />
            <Image
              src="/PajamasWebCloudPurple.png"
              alt="PajamasWeb Logo"
              width={40}
              height={40}
              className="hidden dark:block"
            />
            <span className="hidden sm:inline text-xl font-bold text-black dark:text-white">PajamasWeb</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex gap-8 items-center">
            <a
              href="#offerings"
              className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Services
            </a>
            <Link
              href="/blog"
              className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Blog
            </Link>
            <Link
              href="/case-studies"
              className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Case Studies
            </Link>
            <Link
              href="/portal/signin"
              className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-black dark:text-white" />
            ) : (
              <Menu size={24} className="text-black dark:text-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <div className="px-6 py-4 space-y-3">
              <a
                href="#offerings"
                className="block text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <Link
                href="/blog"
                className="block text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/case-studies"
                className="block text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Case Studies
              </Link>
              <Link
                href="/portal/signin"
                className="block text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <a
                href="#contact"
                className="block text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20 sm:px-8">
        <Image
          src="/tech-bg.png"
          alt="Technology background with digital elements"
          fill
          className="absolute inset-0 object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Bring Your Ideas to Life
          </h1>
          <p className="mb-8 text-xl leading-8 text-zinc-100">
            I&apos;m a freelance developer and designer specializing in creating beautiful,
            functional digital experiences. Let&apos;s build something amazing together.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Get in Touch
            </a>
            <a
              href="#offerings"
              className="inline-flex items-center justify-center rounded-lg border border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section id="offerings" className="bg-zinc-50 px-6 py-20 dark:bg-zinc-950 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-black dark:text-white">
              What I Offer
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              A range of services to help your business succeed online
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {offerings.map((offering, index) => (
              <article
                key={index}
                className="rounded-lg bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900"
              >
                <div className="mb-4 text-4xl" aria-label={offering.title}>{offering.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-black dark:text-white">
                  {offering.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {offering.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-black dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            Let&apos;s discuss your project and see how I can help bring your vision to life.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:info@pajamasweb.com"
              className="inline-flex items-center justify-center rounded-lg bg-black px-8 py-3 font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Send Me an Email
            </a>
            <a
              href="https://cal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-black px-8 py-3 font-semibold text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Book a Call
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit">
                <Image
                  src="/PajamasWebCloud.png"
                  alt="PajamasWeb Logo"
                  width={32}
                  height={32}
                  className="dark:hidden"
                />
                <Image
                  src="/PajamasWebCloudPurple.png"
                  alt="PajamasWeb Logo"
                  width={32}
                  height={32}
                  className="hidden dark:block"
                />
                <span className="font-bold text-black dark:text-white">PajamasWeb</span>
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Freelance developer and designer creating beautiful digital experiences.
              </p>
            </div>

            {/* Main Links */}
            <div>
              <h3 className="mb-4 font-semibold text-black dark:text-white">Main</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#offerings"
                    className="text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/case-studies"
                    className="text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                  >
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-4 font-semibold text-black dark:text-white">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/book"
                    className="text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                  >
                    Book a Call
                  </Link>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="mb-4 font-semibold text-black dark:text-white">Follow</h3>
              <ul className="space-y-2">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              © {new Date().getFullYear()} PajamasWeb. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  );
}

