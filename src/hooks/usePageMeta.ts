import { useEffect } from 'react';

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevDescription = meta?.content;
    const createdMeta = !meta;

    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    return () => {
      document.title = prevTitle;
      if (description && meta) {
        if (createdMeta) meta.remove();
        else if (prevDescription) meta.content = prevDescription;
      }
    };
  }, [title, description]);
}
