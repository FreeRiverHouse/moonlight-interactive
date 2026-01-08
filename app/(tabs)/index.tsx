import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

export default function MoonlightScreen() {
  const [coins, setCoins] = useState(100);
  const [health, setHealth] = useState(80);
  const [hunger, setHunger] = useState(60);
  const [energy, setEnergy] = useState(90);
  const [activity, setActivity] = useState<'idle' | 'eating' | 'sleeping' | 'playing'>('idle');
  const [currentRoom, setCurrentRoom] = useState<'bedroom' | 'kitchen' | 'living'>('bedroom');

  // Animation for character
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const positionX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  const moveCharacter = (targetX: number) => {
    Animated.timing(positionX, {
      toValue: targetX,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const pulseCharacter = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const getMoodEmoji = () => {
    if (activity === 'sleeping') return '😴';
    if (activity === 'eating') return '😋';
    if (activity === 'playing') return '🤗';
    if (hunger < 30) return '😢';
    if (energy < 30) return '😪';
    if (health < 30) return '🤒';
    return '😊';
  };

  const feed = () => {
    if (coins >= 5 && activity === 'idle') {
      setActivity('eating');
      moveCharacter(-40);
      pulseCharacter();
      setTimeout(() => {
        setHunger(Math.min(100, hunger + 25));
        setCoins(coins - 5);
        setActivity('idle');
        moveCharacter(0);
      }, 2000);
    }
  };

  const sleep = () => {
    if (activity === 'idle') {
      setActivity('sleeping');
      moveCharacter(40);
      setTimeout(() => {
        setEnergy(Math.min(100, energy + 35));
        setHealth(Math.min(100, health + 10));
        setActivity('idle');
        moveCharacter(0);
      }, 3000);
    }
  };

  const play = () => {
    if (energy >= 10 && activity === 'idle') {
      setActivity('playing');
      pulseCharacter();
      Animated.sequence([
        Animated.timing(positionX, { toValue: -30, duration: 300, useNativeDriver: true }),
        Animated.timing(positionX, { toValue: 30, duration: 300, useNativeDriver: true }),
        Animated.timing(positionX, { toValue: -20, duration: 300, useNativeDriver: true }),
        Animated.timing(positionX, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        setEnergy(Math.max(0, energy - 15));
        setHealth(Math.min(100, health + 5));
        setCoins(coins + 3);
        setActivity('idle');
      }, 1500);
    }
  };

  const getRoomStyle = () => {
    switch (currentRoom) {
      case 'kitchen': return { backgroundColor: '#fef3c7' };
      case 'living': return { backgroundColor: '#dbeafe' };
      default: return { backgroundColor: '#ede9fe' };
    }
  };

  const getRoomName = () => {
    switch (currentRoom) {
      case 'kitchen': return '🍳 Cucina';
      case 'living': return '🛋️ Salotto';
      default: return '🛏️ Camera';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Moonlight</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      {/* Room Selector */}
      <View style={styles.roomSelector}>
        {['bedroom', 'kitchen', 'living'].map((room) => (
          <TouchableOpacity
            key={room}
            style={[styles.roomTab, currentRoom === room && styles.roomTabActive]}
            onPress={() => setCurrentRoom(room as any)}
          >
            <Text style={styles.roomTabText}>
              {room === 'bedroom' ? '🛏️' : room === 'kitchen' ? '🍳' : '🛋️'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Room with Character */}
      <View style={[styles.roomContainer, getRoomStyle()]}>
        <Text style={styles.roomLabel}>{getRoomName()}</Text>

        {/* Character */}
        <Animated.View style={[
          styles.characterContainer,
          {
            transform: [
              { translateY: bounceAnim },
              { translateX: positionX },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <View style={styles.characterBody}>
            <Text style={styles.characterFace}>{getMoodEmoji()}</Text>
          </View>
          <Text style={styles.characterName}>Moonlight</Text>
        </Animated.View>

        {/* Activity bubble */}
        {activity !== 'idle' && (
          <View style={styles.activityBubble}>
            <Text style={styles.activityText}>
              {activity === 'eating' ? 'Gnam gnam...' :
               activity === 'sleeping' ? 'Zzz...' : 'Evviva!'}
            </Text>
          </View>
        )}
      </View>

      {/* Status Bars */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>❤️</Text>
          <View style={styles.barContainer}>
            <View style={[styles.barFill, styles.healthBar, {width: `${health}%`}]} />
          </View>
          <Text style={styles.statusValue}>{health}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>🍔</Text>
          <View style={styles.barContainer}>
            <View style={[styles.barFill, styles.hungerBar, {width: `${hunger}%`}]} />
          </View>
          <Text style={styles.statusValue}>{hunger}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>⚡</Text>
          <View style={styles.barContainer}>
            <View style={[styles.barFill, styles.energyBar, {width: `${energy}%`}]} />
          </View>
          <Text style={styles.statusValue}>{energy}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, activity !== 'idle' && styles.actionDisabled]}
          onPress={feed}
          disabled={activity !== 'idle'}
        >
          <Text style={styles.actionEmoji}>🍕</Text>
          <Text style={styles.actionText}>Mangia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, activity !== 'idle' && styles.actionDisabled]}
          onPress={play}
          disabled={activity !== 'idle'}
        >
          <Text style={styles.actionEmoji}>🎮</Text>
          <Text style={styles.actionText}>Gioca</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, activity !== 'idle' && styles.actionDisabled]}
          onPress={sleep}
          disabled={activity !== 'idle'}
        >
          <Text style={styles.actionEmoji}>😴</Text>
          <Text style={styles.actionText}>Dormi</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Onde Kids</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4c1d95',
  },
  coinBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
  },
  roomSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  roomTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  roomTabActive: {
    backgroundColor: '#7c3aed',
  },
  roomTabText: {
    fontSize: 20,
  },
  roomContainer: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomLabel: {
    position: 'absolute',
    top: 16,
    left: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#4c1d95',
  },
  characterContainer: {
    alignItems: 'center',
  },
  characterBody: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  characterFace: {
    fontSize: 60,
  },
  characterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4c1d95',
    marginTop: 10,
  },
  activityBubble: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 18,
    width: 28,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  healthBar: {
    backgroundColor: '#ef4444',
  },
  hungerBar: {
    backgroundColor: '#f59e0b',
  },
  energyBar: {
    backgroundColor: '#10b981',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 30,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4c1d95',
    marginTop: 4,
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 16,
  },
});
