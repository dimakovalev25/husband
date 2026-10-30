<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ClearAllCaches extends Command
{
  /**
   * Имя команды. Можно назвать как угодно, хоть "cache".
   */
  protected $signature = 'cache
                            {--skip-events : Не чистить events}
                            {--skip-views : Не чистить views}';

  protected $description = 'Очищает конфиг, кеш приложения, маршруты и (опционально) скомпилированные вьюхи/events';

  public function handle(): int
  {
    $this->info('🧹 Чищу кеши…');

    $commands = [
      'config:clear' => 'Конфиг',
      'cache:clear'  => 'Кеш приложения',
      'route:clear'  => 'Маршруты',
    ];

    if (! $this->option('skip-views')) {
      $commands['view:clear'] = 'Скомпилированные вьюхи';
    }

    if (! $this->option('skip-events')) {
      $commands['event:clear'] = 'События';
    }

    foreach ($commands as $cmd => $label) {
      $this->callSilent($cmd);
      $this->line("  ✔ {$label} ({$cmd})");
    }

    $this->newLine();
    $this->info('✅ Готово. Все кеши сброшены.');

    return self::SUCCESS;
  }
}