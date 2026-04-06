"use client";

import React from 'react'; 
import { Grid2X2Icon } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggle } from '@/components/ui/menu-toggle';

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);

  const links = [
    {
      label: 'Features',
      href: '#',
    },
    {
      label: 'Pricing',
      href: '#',
    },
    {
      label: 'About',
      href: '#',
    },
  ];

  return (
    <header className="bg-black sticky top-0 z-50 w-full border-b border-gray-800">
      <nav className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="/icon.png" 
            alt="ReplySense Logo" 
            className="size-8 rounded object-cover"
          />
          <p className="font-mono text-lg font-bold text-white">ReplySense</p>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link, index) => (
            <a
              key={index}
              className={buttonVariants({ variant: 'ghost' })}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
          <Button variant="outline">Sign In</Button>
          <Button className="bg-[#FF0A54] hover:bg-[#FF0A54]/90 text-white">Get Started</Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <Button size="icon" variant="outline" className="lg:hidden">
            <MenuToggle
              strokeWidth={2.5}
              open={open}
              onOpenChange={setOpen}
              className="size-6"
            />
          </Button>
          <SheetContent
            className="bg-black gap-0 border-gray-800"
            showClose={false}
            side="left"
          >
            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
              {links.map((link, index) => (
                <a
                  key={index}
                  className={buttonVariants({
                    variant: 'ghost',
                    className: 'justify-start',
                  })}
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <SheetFooter>
              <Button variant="outline">Sign In</Button>
              <Button className="bg-[#FF0A54] hover:bg-[#FF0A54]/90 text-white">Get Started</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}