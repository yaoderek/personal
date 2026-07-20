// @vitest-environment jsdom
import { mount, unmount } from 'svelte';
import { test, expect, beforeAll } from 'vitest';
import MobileFiles from './MobileFiles.svelte';
import type { FSNode } from '../../lib/os/types';

beforeAll(() => {
  if (!window.matchMedia) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    });
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
});

// Minimal fixture tree
const fixtureTree: FSNode = {
  name: "derek's mac",
  path: '/',
  kind: 'Folder',
  icon: 'folder',
  children: [
    {
      name: 'README.txt',
      path: '/README.txt',
      kind: 'Plain Text',
      icon: 'doc',
      open: { app: 'doc', props: { title: 'README.txt', html: '<p>hi</p>' } },
    },
    {
      name: 'projects',
      path: '/projects',
      kind: 'Folder',
      icon: 'folder',
      children: [
        {
          name: 'speakeasy.app',
          path: '/projects/speakeasy',
          kind: 'Web app',
          icon: 'app',
          open: {
            app: 'project',
            props: {
              title: 'SpeakEasy',
              oneLiner: 'Speech feedback',
              stack: ['TypeScript'],
              status: 'shipped',
              created: '2024-06-01',
              imageUrls: [],
              bodyHtml: '<p>details</p>',
            },
          },
        },
      ],
    },
  ],
};

test('MobileFiles mounts and shows root folder listing', async () => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const app = mount(MobileFiles, {
    target,
    props: { tree: fixtureTree },
  });
  await new Promise((r) => setTimeout(r, 20));
  const text = target.textContent ?? '';
  // Root listing should show top-level items
  expect(text).toContain('projects');
  unmount(app);
  target.remove();
});

test('MobileFiles: tapping a folder shows its children', async () => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const app = mount(MobileFiles, {
    target,
    props: { tree: fixtureTree },
  });
  await new Promise((r) => setTimeout(r, 20));

  // Find and click the 'projects' row button
  const buttons = Array.from(target.querySelectorAll<HTMLButtonElement>('.file-btn'));
  const projectsBtn = buttons.find((b) => b.textContent?.includes('projects'));
  expect(projectsBtn).not.toBeUndefined();
  projectsBtn!.click();
  await new Promise((r) => setTimeout(r, 20));

  const text = target.textContent ?? '';
  expect(text).toContain('speakeasy.app');

  unmount(app);
  target.remove();
});

test('MobileFiles: back button returns to root', async () => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const app = mount(MobileFiles, {
    target,
    props: { tree: fixtureTree },
  });
  await new Promise((r) => setTimeout(r, 20));

  // Navigate into projects
  const buttons = Array.from(target.querySelectorAll<HTMLButtonElement>('.file-btn'));
  const projectsBtn = buttons.find((b) => b.textContent?.includes('projects'));
  projectsBtn!.click();
  await new Promise((r) => setTimeout(r, 20));

  // Back button should be visible now
  const backBtn = target.querySelector<HTMLButtonElement>('.back-btn');
  expect(backBtn).not.toBeNull();
  backBtn!.click();
  await new Promise((r) => setTimeout(r, 20));

  // Should be back at root — projects row visible again
  const text = target.textContent ?? '';
  expect(text).toContain('projects');
  // Back button should be gone at root
  const backBtnAfter = target.querySelector<HTMLButtonElement>('.back-btn');
  expect(backBtnAfter).toBeNull();

  unmount(app);
  target.remove();
});
