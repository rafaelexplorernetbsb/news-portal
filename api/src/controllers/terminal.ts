import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
	async execute(req: Request, res: Response) {
		try {
			const { command } = req.body;

			if (!command) {
				return res.status(400).json({
					success: false,
					error: 'Comando não fornecido'
				});
			}

			// Lista de comandos permitidos (por segurança)
			const allowedCommands = [
				'ls', 'pwd', 'whoami', 'date', 'echo', 'cat', 'ps', 'top', 'df', 'free',
				'uname', 'uptime', 'env', 'which', 'whereis', 'man', 'curl', 'wget',
				'git', 'npm', 'docker', 'node', 'npm', 'pnpm', 'yarn', 'cd', 'mkdir',
				'rmdir', 'touch', 'cp', 'mv', 'rm', 'find', 'grep', 'head', 'tail',
				'less', 'more', 'sort', 'uniq', 'wc', 'cut', 'awk', 'sed', 'tar',
				'zip', 'unzip', 'chmod', 'chown', 'sudo', 'su', 'passwd', 'history',
				'alias', 'export', 'source', 'type', 'hash', 'jobs', 'bg', 'fg',
				'kill', 'killall', 'nohup', 'screen', 'tmux', 'ssh', 'scp', 'rsync'
			];

			const commandName = command.split(' ')[0];

			// Verificar se o comando é permitido
			if (!allowedCommands.includes(commandName)) {
				return res.status(403).json({
					success: false,
					error: `Comando '${commandName}' não é permitido por motivos de segurança`
				});
			}

			// Executar comando com timeout de 30 segundos
			const { stdout, stderr } = await execAsync(command, {
				timeout: 30000,
				cwd: process.cwd(),
				env: process.env
			});

			// Retornar resultado
			const output = stdout || stderr || '';

			res.json({
				success: true,
				output: output,
				command: command
			});

		} catch (error: any) {
			// Tratar diferentes tipos de erro
			let errorMessage = 'Erro desconhecido';

			if (error.code === 'ETIMEDOUT') {
				errorMessage = 'Comando excedeu o tempo limite de 30 segundos';
			} else if (error.code === 'ENOENT') {
				errorMessage = `Comando não encontrado: ${command.split(' ')[0]}`;
			} else if (error.stderr) {
				errorMessage = error.stderr;
			} else if (error.message) {
				errorMessage = error.message;
			}

			res.status(500).json({
				success: false,
				error: errorMessage,
				command: req.body.command
			});
		}
	}
};

