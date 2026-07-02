import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * DynamicText.T component
 * A wrapper to handle translations using react-i18next.
 * It provides a drop-in replacement for the legacy DynamicText system.
 */
const T = ({ tid, fallback, children, components }) => {
  const { t } = useTranslation();

  // If tid is provided, use it to look up the translation
  if (tid) {
    return <>{t(tid, fallback || children || tid)}</>;
  }

  // Fallback to children or tid if something went wrong
  return <>{children || tid}</>;
};

export default T;
export { T };
