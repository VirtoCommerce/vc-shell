import { hasInjectionContext, inject, provide } from "vue";
import { LanguageServiceKey } from "../../../injection-keys";
import { ILanguageService, createLanguageService } from "../../services/language-service";
import { createLogger, InjectionError } from "../../utilities";

const logger = createLogger("use-languages");
let fallbackLanguageService: ILanguageService | null = null;

export interface IUseLanguages extends ILanguageService {}

function getOrCreateFallbackLanguageService(): ILanguageService {
  if (!fallbackLanguageService) {
    fallbackLanguageService = createLanguageService();
  }

  return fallbackLanguageService;
}

export function provideLanguages(): ILanguageService {
  if (!hasInjectionContext()) {
    logger.warn("No injection context for provideLanguages; using fallback language service");
    return getOrCreateFallbackLanguageService();
  }

  const existingService = inject(LanguageServiceKey, null);
  if (existingService) {
    return existingService;
  }

  const service = createLanguageService();
  provide(LanguageServiceKey, service);
  return service;
}

export function useLanguages(): IUseLanguages {
  if (!hasInjectionContext()) {
    return getOrCreateFallbackLanguageService();
  }

  const languageService = inject(LanguageServiceKey, null);

  if (!languageService) {
    logger.error("Language service not found");
    throw new InjectionError("LanguageService");
  }

  return languageService;
}
