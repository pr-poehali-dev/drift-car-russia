import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

type Car = {
  id: string;
  name: string;
  speed: number;
  handling: number;
  acceleration: number;
  maxSpeed: number;
  maxHandling: number;
  maxAcceleration: number;
  price: number;
  unlocked: boolean;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
};

type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  car: string;
};

type GameState = {
  cars: Car[];
  credits: number;
  selectedCar: string;
  settings: {
    music: number;
    sfx: number;
    sensitivity: number;
  };
  achievements: Achievement[];
};

const INITIAL_CARS: Car[] = [
  {
    id: 'uaz',
    name: 'УАЗ Hunter',
    speed: 45,
    handling: 30,
    acceleration: 40,
    maxSpeed: 100,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 0,
    unlocked: true,
  },
  {
    id: 'lada',
    name: 'Lada 2107',
    speed: 55,
    handling: 50,
    acceleration: 60,
    maxSpeed: 100,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 2000,
    unlocked: true,
  },
  {
    id: 'zhiguli',
    name: 'Жигули 2106',
    speed: 60,
    handling: 55,
    acceleration: 65,
    maxSpeed: 100,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 3500,
    unlocked: false,
  },
  {
    id: 'niva',
    name: 'Lada Niva',
    speed: 50,
    handling: 70,
    acceleration: 55,
    maxSpeed: 100,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 4500,
    unlocked: false,
  },
  {
    id: 'vaz',
    name: 'ВАЗ 2114',
    speed: 75,
    handling: 65,
    acceleration: 80,
    maxSpeed: 100,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 6000,
    unlocked: false,
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Первый дрифт', description: 'Выполните свой первый дрифт', completed: false, icon: 'Zap' },
  { id: '2', title: 'Коллекционер', description: 'Разблокируйте все автомобили', completed: false, icon: 'Trophy' },
  { id: '3', title: 'Король дрифта', description: 'Наберите 10000 очков за один дрифт', completed: false, icon: 'Crown' },
  { id: '4', title: 'Тюнер', description: 'Максимально улучшите любой автомобиль', completed: false, icon: 'Wrench' },
  { id: '5', title: 'Легенда', description: 'Займите 1 место в лидерборде', completed: false, icon: 'Star' },
];

const Index = () => {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<'home' | 'garage' | 'city' | 'leaderboard' | 'achievements' | 'settings'>('home');
  const [selectedCar, setSelectedCar] = useState<string>('lada');
  const [credits, setCredits] = useState(5000);
  const [driftScore, setDriftScore] = useState(0);
  const [isDrifting, setIsDrifting] = useState(false);
  const [carPosition, setCarPosition] = useState({ x: 50, y: 50 });
  const [carRotation, setCarRotation] = useState(0);
  const [settings, setSettings] = useState({
    music: 70,
    sfx: 80,
    sensitivity: 50,
  });

  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const driftSoundRef = useRef<HTMLAudioEngine | null>(null);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: 'DRIFT_KING_77', score: 25680, car: 'ВАЗ 2114' },
    { rank: 2, name: 'NeonRacer', score: 23450, car: 'Жигули 2106' },
    { rank: 3, name: 'CyberDriver', score: 21230, car: 'Lada Niva' },
    { rank: 4, name: 'RussianDrift', score: 19880, car: 'Lada 2107' },
    { rank: 5, name: 'MoscowNights', score: 18560, car: 'ВАЗ 2114' },
  ]);

  useEffect(() => {
    const savedState = localStorage.getItem('driftCarRussiaState');
    if (savedState) {
      try {
        const parsed: GameState = JSON.parse(savedState);
        setCars(parsed.cars);
        setCredits(parsed.credits);
        setSelectedCar(parsed.selectedCar);
        setSettings(parsed.settings);
        setAchievements(parsed.achievements);
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, []);

  useEffect(() => {
    const stateToSave: GameState = {
      cars,
      credits,
      selectedCar,
      settings,
      achievements,
    };
    localStorage.setItem('driftCarRussiaState', JSON.stringify(stateToSave));
  }, [cars, credits, selectedCar, settings, achievements]);

  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio();
      musicRef.current.loop = true;
      musicRef.current.volume = settings.music / 100;
    }
    musicRef.current.volume = settings.music / 100;
  }, [settings.music]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.completed) {
      setAchievements(prev => prev.map(a => 
        a.id === achievementId ? { ...a, completed: true } : a
      ));
      toast({
        title: '🏆 Достижение разблокировано!',
        description: achievement.title,
      });
      playSound('achievement');
    }
  };

  const playSound = (type: 'drift' | 'upgrade' | 'achievement' | 'button') => {
    if (settings.sfx === 0) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = settings.sfx / 100 * 0.3;
    
    switch (type) {
      case 'drift':
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        break;
      case 'upgrade':
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        break;
      case 'achievement':
        oscillator.frequency.value = 1000;
        oscillator.type = 'triangle';
        break;
      case 'button':
        oscillator.frequency.value = 400;
        oscillator.type = 'square';
        break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const updateCarPosition = () => {
    const car = cars.find(c => c.id === selectedCar);
    if (!car) return;

    let newX = carPosition.x;
    let newY = carPosition.y;
    let newRotation = carRotation;
    let isDriftingNow = false;

    const speed = car.speed / 100 * (settings.sensitivity / 50);
    const handling = car.handling / 100 * 5;

    if (keysPressed.current.has('w')) {
      const rad = (newRotation * Math.PI) / 180;
      newX += Math.sin(rad) * speed;
      newY -= Math.cos(rad) * speed;
    }
    if (keysPressed.current.has('s')) {
      const rad = (newRotation * Math.PI) / 180;
      newX -= Math.sin(rad) * speed * 0.5;
      newY += Math.cos(rad) * speed * 0.5;
    }
    if (keysPressed.current.has('a')) {
      newRotation -= handling;
      if (keysPressed.current.has('w') || keysPressed.current.has('s')) {
        isDriftingNow = true;
      }
    }
    if (keysPressed.current.has('d')) {
      newRotation += handling;
      if (keysPressed.current.has('w') || keysPressed.current.has('s')) {
        isDriftingNow = true;
      }
    }

    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));

    setCarPosition({ x: newX, y: newY });
    setCarRotation(newRotation % 360);

    if (isDriftingNow) {
      const driftPoints = Math.floor(Math.random() * 20) + 5;
      setDriftScore(prev => prev + driftPoints);
    }
  };

  useEffect(() => {
    if (currentSection === 'city') {
      gameLoopRef.current = window.setInterval(updateCarPosition, 50);
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [currentSection, carPosition, carRotation, selectedCar, settings.sensitivity]);

  const upgradeCar = (carId: string, stat: 'speed' | 'handling' | 'acceleration') => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    const upgradeCost = 500;
    const maxValue = stat === 'speed' ? car.maxSpeed : stat === 'handling' ? car.maxHandling : car.maxAcceleration;
    const currentValue = car[stat];

    if (credits >= upgradeCost && currentValue < maxValue) {
      setCars(cars.map(c => 
        c.id === carId 
          ? { ...c, [stat]: Math.min(currentValue + 10, maxValue) }
          : c
      ));
      setCredits(credits - upgradeCost);
      playSound('upgrade');

      const upgradedCar = cars.find(c => c.id === carId);
      if (upgradedCar && upgradedCar.speed === maxValue && upgradedCar.handling === maxValue && upgradedCar.acceleration === maxValue) {
        unlockAchievement('4');
      }
    }
  };

  const unlockCar = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car || car.unlocked) return;

    if (credits >= car.price) {
      setCars(cars.map(c => 
        c.id === carId ? { ...c, unlocked: true } : c
      ));
      setCredits(credits - car.price);
      playSound('upgrade');

      if (cars.filter(c => c.unlocked).length + 1 === cars.length) {
        unlockAchievement('2');
      }
    }
  };

  const startDrift = () => {
    setIsDrifting(true);
    playSound('drift');
    
    const driftInterval = setInterval(() => {
      setDriftScore(prev => prev + Math.floor(Math.random() * 50) + 10);
    }, 100);

    setTimeout(() => {
      setIsDrifting(false);
      clearInterval(driftInterval);
      const earnedCredits = Math.floor(driftScore / 10);
      setCredits(prev => prev + earnedCredits);
      
      if (driftScore >= 10000) {
        unlockAchievement('3');
      }
      if (!achievements.find(a => a.id === '1')?.completed) {
        unlockAchievement('1');
      }
    }, 3000);
  };

  const resetProgress = () => {
    setCars(INITIAL_CARS);
    setCredits(5000);
    setSelectedCar('lada');
    setAchievements(INITIAL_ACHIEVEMENTS);
    setSettings({ music: 70, sfx: 80, sensitivity: 50 });
    localStorage.removeItem('driftCarRussiaState');
    toast({
      title: '🔄 Прогресс сброшен',
      description: 'Все данные удалены',
    });
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-8 max-w-4xl">
        <h1 className="font-orbitron text-8xl font-black neon-text-cyan tracking-wider animate-glitch">
          DRIFT CAR RUSSIA
        </h1>
        <p className="font-roboto text-2xl neon-text-magenta">
          Свободное вождение • Киберпанк • Неоновые ночи
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
          {['garage', 'city', 'leaderboard', 'achievements', 'settings'].map((section) => {
            const icons = {
              garage: 'Car',
              city: 'Building',
              leaderboard: 'Trophy',
              achievements: 'Award',
              settings: 'Settings',
            };
            const labels = {
              garage: 'Гараж',
              city: 'Город',
              leaderboard: 'Лидерборд',
              achievements: 'Достижения',
              settings: 'Настройки',
            };
            return (
              <Button
                key={section}
                onClick={() => {
                  setCurrentSection(section as any);
                  playSound('button');
                }}
                className="h-24 text-xl font-orbitron bg-card hover:bg-card/80 neon-border-cyan border-2 transition-all hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name={icons[section as keyof typeof icons] as any} size={32} className="neon-text-cyan" />
                  <span className="neon-text-purple">{labels[section as keyof typeof labels]}</span>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Icon name="Coins" className="neon-text-magenta" size={32} />
          <span className="font-orbitron text-3xl neon-text-cyan">{credits} ₽</span>
        </div>
      </div>
    </div>
  );

  const renderGarage = () => {
    const car = cars.find(c => c.id === selectedCar);
    if (!car) return null;

    return (
      <div className="min-h-screen p-8">
        <Button
          onClick={() => {
            setCurrentSection('home');
            playSound('button');
          }}
          className="mb-6 neon-border-cyan border-2 font-orbitron"
        >
          <Icon name="ArrowLeft" className="mr-2" />
          Назад
        </Button>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="font-orbitron text-4xl neon-text-cyan">ГАРАЖ</h2>
            <div className="space-y-3">
              {cars.map((c) => (
                <Card
                  key={c.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedCar === c.id 
                      ? 'neon-border-cyan scale-105' 
                      : 'border-muted hover:border-primary'
                  } ${!c.unlocked ? 'opacity-50' : ''}`}
                  onClick={() => {
                    if (c.unlocked) {
                      setSelectedCar(c.id);
                      playSound('button');
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Icon name="Car" size={32} className="neon-text-magenta" />
                      <div>
                        <h3 className="font-orbitron text-xl neon-text-purple">{c.name}</h3>
                        {!c.unlocked && (
                          <p className="text-sm text-muted-foreground">
                            Цена: {c.price} ₽
                          </p>
                        )}
                      </div>
                    </div>
                    {!c.unlocked ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          unlockCar(c.id);
                        }}
                        disabled={credits < c.price}
                        className="neon-border-magenta border-2 font-orbitron"
                      >
                        Купить
                      </Button>
                    ) : (
                      <Badge className="bg-primary font-orbitron">Куплено</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {car.unlocked && (
            <div className="space-y-6">
              <Card className="p-6 border-2 neon-border-cyan">
                <h3 className="font-orbitron text-2xl neon-text-magenta mb-6">{car.name}</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-roboto neon-text-purple">Скорость</span>
                      <span className="font-orbitron neon-text-cyan">{car.speed}/{car.maxSpeed}</span>
                    </div>
                    <Progress value={car.speed} className="h-2" />
                    <Button
                      onClick={() => upgradeCar(car.id, 'speed')}
                      disabled={car.speed >= car.maxSpeed || credits < 500}
                      className="mt-2 w-full neon-border-magenta border font-orbitron"
                      size="sm"
                    >
                      Улучшить (500₽)
                    </Button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-roboto neon-text-purple">Управляемость</span>
                      <span className="font-orbitron neon-text-cyan">{car.handling}/{car.maxHandling}</span>
                    </div>
                    <Progress value={car.handling} className="h-2" />
                    <Button
                      onClick={() => upgradeCar(car.id, 'handling')}
                      disabled={car.handling >= car.maxHandling || credits < 500}
                      className="mt-2 w-full neon-border-magenta border font-orbitron"
                      size="sm"
                    >
                      Улучшить (500₽)
                    </Button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-roboto neon-text-purple">Ускорение</span>
                      <span className="font-orbitron neon-text-cyan">{car.acceleration}/{car.maxAcceleration}</span>
                    </div>
                    <Progress value={car.acceleration} className="h-2" />
                    <Button
                      onClick={() => upgradeCar(car.id, 'acceleration')}
                      disabled={car.acceleration >= car.maxAcceleration || credits < 500}
                      className="mt-2 w-full neon-border-magenta border font-orbitron"
                      size="sm"
                    >
                      Улучшить (500₽)
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Icon name="Coins" className="neon-text-magenta" size={32} />
                  <span className="font-orbitron text-3xl neon-text-cyan">{credits} ₽</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCity = () => {
    const car = cars.find(c => c.id === selectedCar);
    
    return (
      <div className="min-h-screen p-8">
        <Button
          onClick={() => {
            setCurrentSection('home');
            playSound('button');
          }}
          className="mb-6 neon-border-cyan border-2 font-orbitron"
        >
          <Icon name="ArrowLeft" className="mr-2" />
          Назад
        </Button>

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="font-orbitron text-4xl neon-text-cyan mb-2">НЕОНОВЫЙ ГОРОД</h2>
            <p className="font-roboto text-lg neon-text-magenta">Управление: W A S D</p>
          </div>

          <Card className="p-8 border-2 neon-border-cyan relative overflow-hidden h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"></div>
            
            <div
              className="absolute w-12 h-12 flex items-center justify-center transition-all duration-75"
              style={{
                left: `${carPosition.x}%`,
                top: `${carPosition.y}%`,
                transform: `translate(-50%, -50%) rotate(${carRotation}deg)`,
              }}
            >
              <Icon name="Car" size={48} className="neon-text-magenta" />
            </div>

            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-20 bg-primary/30"
                style={{
                  left: `${(i * 5) % 100}%`,
                  top: `${Math.floor(i / 20) * 25}%`,
                }}
              />
            ))}
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-2 neon-border-cyan">
              <div className="text-center space-y-4">
                <div className="font-orbitron text-6xl neon-text-cyan">
                  {driftScore}
                </div>
                <p className="font-roboto neon-text-magenta">ОЧКИ ДРИФТА</p>
                <Button
                  onClick={startDrift}
                  disabled={isDrifting}
                  className="w-full h-16 text-xl font-orbitron neon-border-magenta border-2 hover:scale-105 transition-all"
                >
                  {isDrifting ? (
                    <span className="animate-pulse">ДРИФТУЕМ...</span>
                  ) : (
                    <>
                      <Icon name="Zap" className="mr-2" size={24} />
                      АВТОДРИФТ
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-2 neon-border-cyan">
              <div className="space-y-4">
                <h3 className="font-orbitron text-2xl neon-text-purple text-center">{car?.name}</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-orbitron text-2xl neon-text-cyan">{credits}</div>
                    <div className="font-roboto text-sm neon-text-purple">Кредиты</div>
                  </div>
                  <div>
                    <div className="font-orbitron text-2xl neon-text-magenta">
                      {achievements.filter(a => a.completed).length}/{achievements.length}
                    </div>
                    <div className="font-roboto text-sm neon-text-purple">Достижения</div>
                  </div>
                  <div>
                    <div className="font-orbitron text-2xl neon-text-cyan">
                      {cars.filter(c => c.unlocked).length}/{cars.length}
                    </div>
                    <div className="font-roboto text-sm neon-text-purple">Машины</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-primary space-y-2">
                  <div className="flex justify-between font-roboto text-sm">
                    <span className="neon-text-cyan">Скорость: {car?.speed}</span>
                    <span className="neon-text-magenta">Управление: {car?.handling}</span>
                  </div>
                  <div className="flex justify-center">
                    <span className="neon-text-purple font-roboto text-sm">Ускорение: {car?.acceleration}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="min-h-screen p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-4xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">ЛИДЕРБОРД</h2>
        
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <Card
              key={entry.rank}
              className={`p-6 border-2 transition-all ${
                entry.rank <= 3 
                  ? 'neon-border-cyan animate-neon-pulse' 
                  : 'border-muted hover:border-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`font-orbitron text-4xl ${
                    entry.rank === 1 ? 'neon-text-cyan' :
                    entry.rank === 2 ? 'neon-text-magenta' :
                    entry.rank === 3 ? 'neon-text-purple' :
                    'text-muted-foreground'
                  }`}>
                    #{entry.rank}
                  </div>
                  <div>
                    <h3 className="font-orbitron text-xl neon-text-purple">{entry.name}</h3>
                    <p className="font-roboto text-sm text-muted-foreground">{entry.car}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-orbitron text-2xl neon-text-cyan">{entry.score.toLocaleString()}</div>
                  <div className="font-roboto text-sm neon-text-magenta">очков</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="min-h-screen p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-4xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">ДОСТИЖЕНИЯ</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-6 border-2 transition-all ${
                achievement.completed 
                  ? 'neon-border-cyan' 
                  : 'border-muted opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <Icon 
                  name={achievement.icon as any} 
                  size={48} 
                  className={achievement.completed ? 'neon-text-magenta' : 'text-muted-foreground'} 
                />
                <div className="flex-1">
                  <h3 className="font-orbitron text-xl neon-text-purple mb-1">
                    {achievement.title}
                  </h3>
                  <p className="font-roboto text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  {achievement.completed && (
                    <Badge className="mt-2 bg-primary font-orbitron">Выполнено</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="min-h-screen p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-2xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">НАСТРОЙКИ</h2>
        
        <Card className="p-8 border-2 neon-border-cyan space-y-8">
          <div>
            <div className="flex justify-between mb-4">
              <span className="font-roboto text-lg neon-text-purple">Музыка</span>
              <span className="font-orbitron neon-text-cyan">{settings.music}%</span>
            </div>
            <Slider
              value={[settings.music]}
              onValueChange={(value) => setSettings({ ...settings, music: value[0] })}
              max={100}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <span className="font-roboto text-lg neon-text-purple">Звуковые эффекты</span>
              <span className="font-orbitron neon-text-cyan">{settings.sfx}%</span>
            </div>
            <Slider
              value={[settings.sfx]}
              onValueChange={(value) => setSettings({ ...settings, sfx: value[0] })}
              max={100}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <span className="font-roboto text-lg neon-text-purple">Чувствительность управления</span>
              <span className="font-orbitron neon-text-cyan">{settings.sensitivity}%</span>
            </div>
            <Slider
              value={[settings.sensitivity]}
              onValueChange={(value) => setSettings({ ...settings, sensitivity: value[0] })}
              max={100}
              step={1}
            />
          </div>

          <div className="pt-6 border-t border-primary space-y-4">
            <Button 
              onClick={resetProgress}
              className="w-full neon-border-magenta border-2 font-orbitron"
            >
              <Icon name="RotateCcw" className="mr-2" />
              Сбросить прогресс
            </Button>
            <Button className="w-full neon-border-cyan border-2 font-orbitron">
              <Icon name="Info" className="mr-2" />
              О игре
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-roboto">
      {currentSection === 'home' && renderHome()}
      {currentSection === 'garage' && renderGarage()}
      {currentSection === 'city' && renderCity()}
      {currentSection === 'leaderboard' && renderLeaderboard()}
      {currentSection === 'achievements' && renderAchievements()}
      {currentSection === 'settings' && renderSettings()}
    </div>
  );
};

export default Index;
