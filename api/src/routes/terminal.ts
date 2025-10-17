import { Router } from 'express';
import terminalController from '../controllers/terminal';

const router = Router();

// Endpoint para executar comandos do terminal
router.post('/execute', terminalController.execute);

export default router;

