package com.example.itantra

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.roundToInt

private val Bg = Color(0xFFF7F9FC)
private val Ink = Color(0xFF182230)
private val Muted = Color(0xFF667085)
private val Primary = Color(0xFF2563EB)
private val Success = Color(0xFF12B76A)
private val Danger = Color(0xFFD92D20)
private val Card = Color.White

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { ITransceiverApp() }
    }
}

@Composable
fun ITransceiverApp() {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Primary,
            background = Bg,
            surface = Card
        )
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Bg
        ) {
            AppShell()
        }
    }
}

@Composable
fun AppShell() {
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        containerColor = Bg,
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                val items = listOf(
                    Icons.Default.Home to "Home",
                    Icons.Default.Message to "Messages",
                    Icons.Default.Warning to "Emergency",
                    Icons.Default.Settings to "Settings"
                )
                items.forEachIndexed { index, (icon, label) ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label) }
                    )
                }
            }
        }
    ) { padding ->
        when (selectedTab) {
            0 -> HomeScreen(Modifier.padding(padding))
            1 -> MessagesScreen(Modifier.padding(padding))
            2 -> EmergencyScreen(Modifier.padding(padding))
            else -> SettingsScreen(Modifier.padding(padding))
        }
    }
}

@Composable
fun Header() {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    "iTANTRA",
                    color = Ink,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    "Offline voice communication",
                    color = Muted,
                    fontSize = 12.sp
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatusChip("OFFLINE", Success, Icons.Default.CloudOff)
                StatusChip("Connected", Primary, Icons.Default.Bluetooth)
            }
        }
        Spacer(Modifier.height(18.dp))
    }
}

@Composable
fun StatusChip(label: String, tint: Color, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Surface(
        shape = RoundedCornerShape(50),
        color = tint.copy(alpha = 0.10f)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = tint, modifier = Modifier.size(15.dp))
            Spacer(Modifier.width(5.dp))
            Text(label, color = tint, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun LanguageCard() {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Card)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text("Language", fontSize = 12.sp, color = Muted)
                Text("English", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Ink)
            }
            Icon(Icons.Default.KeyboardArrowDown, null, tint = Muted)
        }
    }
}

@Composable
fun HomeScreen(modifier: Modifier = Modifier) {
    var talking by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (talking) 1.06f else 1f, label = "ptt")
    val micColor by animateColorAsState(if (talking) Danger else Primary, label = "mic")

    Column(
        modifier = modifier.fillMaxSize().padding(horizontal = 20.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Header()
        LanguageCard()

        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Card),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    if (talking) "Listening…" else "Push-to-talk",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Ink
                )
                Spacer(Modifier.height(16.dp))

                Box(
                    modifier = Modifier
                        .size(168.dp)
                        .scale(scale)
                        .background(micColor.copy(alpha = 0.10f), CircleShape)
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Surface(
                        modifier = Modifier.fillMaxSize().clickable { talking = !talking },
                        color = micColor,
                        shape = CircleShape,
                        shadowElevation = 8.dp
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Default.Mic,
                                contentDescription = "Push to Talk",
                                tint = Color.White,
                                modifier = Modifier.size(48.dp)
                            )
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))
                Text(
                    if (talking) "Release to send" else "Hold to Speak",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Ink
                )
                Text(
                    "English • PTT mode",
                    fontSize = 12.sp,
                    color = Muted
                )
            }
        }

        Card(
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Card)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Live transcription", fontSize = 12.sp, color = Muted)
                Spacer(Modifier.height(7.dp))
                Text(
                    "“Emergency team required at checkpoint 2.”",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Ink
                )
                Spacer(Modifier.height(12.dp))
                PipelineRow()
            }
        }

        EmergencyMiniCard()
    }
}

@Composable
fun PipelineRow() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        PipelineItem("STT", Icons.Default.RecordVoiceOver)
        Arrow()
        PipelineItem("Secure", Icons.Default.Lock)
        Arrow()
        PipelineItem("Wireless", Icons.Default.Bluetooth)
    }
}

@Composable
fun PipelineItem(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, null, tint = Primary, modifier = Modifier.size(21.dp))
        Text(label, fontSize = 10.sp, color = Muted, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun Arrow() {
    Icon(Icons.Default.ArrowForward, null, tint = Muted, modifier = Modifier.size(18.dp))
}

@Composable
fun EmergencyMiniCard() {
    Surface(
        color = Danger.copy(alpha = 0.08f),
        shape = RoundedCornerShape(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(color = Danger, shape = CircleShape, modifier = Modifier.size(42.dp)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Warning, null, tint = Color.White)
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text("EMERGENCY", color = Danger, fontWeight = FontWeight.ExtraBold, fontSize = 12.sp)
                Text("Medical assistance required", color = Ink, fontWeight = FontWeight.SemiBold)
                Text("Maximum volume • Non-interruptible", color = Muted, fontSize = 11.sp)
            }
            Icon(Icons.Default.VolumeUp, null, tint = Danger)
        }
    }
}

@Composable
fun MessagesScreen(modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize().padding(20.dp)) {
        Header()
        Text("Messages", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = Ink)
        Spacer(Modifier.height(12.dp))
        MessageCard("You", "Emergency team required at checkpoint 2.", Icons.Default.KeyboardVoice)
        Spacer(Modifier.height(10.dp))
        MessageCard("Receiver", "Message received and ready for voice playback.", Icons.Default.VolumeUp)
    }
}

@Composable
fun MessageCard(sender: String, text: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Card(shape = RoundedCornerShape(18.dp)) {
        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = Primary, modifier = Modifier.size(26.dp))
            Spacer(Modifier.width(12.dp))
            Column {
                Text(sender, fontSize = 12.sp, color = Muted)
                Text(text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Ink)
            }
        }
    }
}

@Composable
fun EmergencyScreen(modifier: Modifier = Modifier) {
    Column(
        modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Header()
        Surface(
            color = Danger.copy(alpha = 0.08f),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(
                Modifier.fillMaxWidth().padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Surface(color = Danger, shape = CircleShape, modifier = Modifier.size(72.dp)) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Warning, null, tint = Color.White, modifier = Modifier.size(38.dp))
                    }
                }
                Spacer(Modifier.height(14.dp))
                Text("EMERGENCY", color = Danger, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                Text("Medical assistance required", color = Ink, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Text(
                    "ALERT ACTIVE",
                    color = Danger,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.5.sp
                )
                Spacer(Modifier.height(14.dp))
                Text("Maximum volume • Non-interruptible", color = Muted, textAlign = TextAlign.Center)
                Spacer(Modifier.height(20.dp))
                Button(
                    onClick = {},
                    colors = ButtonDefaults.buttonColors(containerColor = Danger),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.VolumeUp, null)
                    Spacer(Modifier.width(8.dp))
                    Text("Playing Emergency Alert")
                }
            }
        }
    }
}

@Composable
fun SettingsScreen(modifier: Modifier = Modifier) {
    Column(
        modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Header()
        Text("Settings", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = Ink)
        SettingRow("Default language", "English", Icons.Default.Language)
        SettingRow("PTT mode", "Enabled", Icons.Default.Mic)
        SettingRow("Secure transmission", "Enabled", Icons.Default.Lock)
        SettingRow("Offline inference", "Enabled", Icons.Default.CloudOff)
    }
}

@Composable
fun SettingRow(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Card(shape = RoundedCornerShape(18.dp)) {
        Row(
            Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = Primary, modifier = Modifier.size(24.dp))
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold, color = Ink)
                Text(value, fontSize = 12.sp, color = Muted)
            }
            Icon(Icons.Default.CheckCircle, null, tint = Success)
        }
    }
}