import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Signup } from './signup';
import { Error } from './error';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup }
] as Routes;
