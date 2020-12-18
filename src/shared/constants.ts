import { AppProcessEnvironment } from '@loadenv';

// Strings
export const paramMissingError = 'One or more of the required parameters was missing.';
export const loginFailedErr = 'Login failed';

// Numbers
export const pwdSaltRounds = 12;

// Cookie Properties
export const cookieProps = Object.freeze({
    key: 'ExpressGeneratorTs',
    secret: AppProcessEnvironment.getProcessEnv().COOKIE_SECRET,
    options: {
        httpOnly: true,
        signed: true,
        path: (AppProcessEnvironment.getProcessEnv().COOKIE_PATH),
        maxAge: Number(AppProcessEnvironment.getProcessEnv().COOKIE_EXP),
        domain: (AppProcessEnvironment.getProcessEnv().COOKIE_DOMAIN),
        secure: (AppProcessEnvironment.getProcessEnv().SECURE_COOKIE === 'true'),
    },
});
