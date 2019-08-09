from django.db import models
from django.utils.translation import ugettext_lazy as _
import datetime

# Create your models here.


class User(models.Model):
    """
    用户表
    """
    user_id=models.IntegerField(_('用户ID'),unique=True)
    tuiJianCard=models.CharField(_('推荐码'),null=True,blank=True,max_length=10)
    email = models.CharField(_('邮箱'),null=True,blank=True,max_length=20)
    phoneNumber = models.CharField(_('手机号码'),null=True,blank=True,max_length=11)
    name= models.CharField(_('昵称'),max_length=20)
    pwd=models.CharField(_('登录密码'),max_length=10)
    tiXianpwd = models.CharField(_('提现密码'),max_length=6)
    yuE= models.IntegerField(_('账户余额'))
    register_time = models.DateTimeField(_('注册时间'),default=datetime.datetime.now)

    def __str__(self):
        return self.name


class YingHang(models.Model):
    """
    银行卡表
    """
    yinghangid=models.IntegerField(_('银行卡ID'),unique=True)
    yingHangCard= models.CharField(_('银行卡号'),max_length=19)
    yinghangName= models.CharField(_("银行名称"),choices=(('0','中国建设银行'),('1','中国工商银行')),max_length=20)

    def __str__(self):
        return str(self.yingHangCard)


class JiFen(models.Model):
    """
    用户积分表
    """
    jifenid=models.IntegerField(_('用户积分ID'),unique=True)
    user_id= models.ForeignKey('User',on_delete=models.CASCADE)
    jifen = models.IntegerField(_('积分'))

    def __str__(self):
        return str(self.jifen)

class JiFenDuiHunan(models.Model):
    """
    用户积分兑换记录
    """
    jifenduihuanid =models.IntegerField(_('积分兑换ID'),unique=True)
    minJifen= models.IntegerField(_("最少兑换积分"),default=10000)
    duiHuanTime = models.DateTimeField(_('兑换时间'),default=datetime.datetime.now)

    def __str__(self):
        return str(self.id)


class DaiLi(models.Model):
    """
    用户代理表
    """
    dailiid= models.IntegerField(_('代理ID'),unique=True)
    user_id = models.ManyToManyField(to='User',related_query_name='m2m')
    tuiJIinama= models.CharField(_('推荐码'),max_length=20)

    def __str__(self):
        return str(self.id)


class ChongZhi(models.Model):
    """
    充值表
    """
    chongzhiid = models.IntegerField(_('充值ID'),unique=True)
    user_id= models.ForeignKey('User',on_delete=models.CASCADE)
    number = models.IntegerField(_('充值金额'))
    method = models.CharField(_('充值方式'),choices=(('0',_('微信')), ('1',_('支付')), ('2',_('网银')),('3',_('其他'))),max_length=10)
    chongZhitime = models.DateTimeField(_('充值时间'),default=datetime.datetime.now)
    chengZhangzhi=models.IntegerField(_("成长值"))

    def __str__(self):
        return str(self.id)


class CaiZhong(models.Model):
    """
    彩种表
    """
    caizhongid= models.IntegerField('彩种ID',unique=True)
    name= models.CharField(_('彩种名称'),max_length=20)
    time = models.DateTimeField(_('彩种开奖时间'))
    add_time = models.DateTimeField(_('彩种添加时间'),default=datetime.datetime.now)

    def __str__(self):
        return str(self.name)


class KaiJiang(models.Model):
    """
    开奖表
    """
    kaijiangid= models.IntegerField(_('开奖ID'),unique=True)
    qiHao = models.IntegerField('开奖期号',unique=True)
    haoma = models.CharField(_('开奖号码'),max_length=10)
    heZhi= models.IntegerField(_('开奖和'))
    result1= models.CharField(_('开奖结果1'),choices=(('0',_('单')),('1',_('双'))),max_length=10)
    result2= models.CharField(_('开奖结果2'),choices=(('0',_('大')),('1',_('小'))),max_length=10)
    kaiJiangtime =models.DateTimeField(_("开奖时间"),default=datetime.datetime.now)

    def __str__(self):
        return str(self.qiHao)


class PeiLv(models.Model):
    """
    赔率表
    首次设计多个彩种只有一种赔率 后期再说
    """
    peilvid= models.IntegerField(_('赔率ID'),unique=True)
    caiZhong = models.ForeignKey('CaiZhong',on_delete=models.CASCADE)
    peiLv= models.CharField(_('赔率'),choices=(((3,189.000),((4,60.000)),((5,30.000)),(6,19.000))),max_length=20)

    def __str__(self):
        return str(self.peilvid)


class TouZhu(models.Model):
    """
    投注表
    """
    touzhuid= models.IntegerField(_('投注ID'),unique=True)
    user_id= models.ForeignKey('User',on_delete=models.CASCADE)
    kaiJiang= models.ForeignKey('KaiJiang',on_delete=models.CASCADE)
    jinE=models.IntegerField(_('投注金额'),default=0)
    touZhuYingKui=models.IntegerField(_('投注盈亏'))
    touZhuTime = models.DateTimeField(_('投注时间'),default=datetime.datetime.now)


    def __str__(self):
        return str(self.id)


class TiXian(models.Model):
    """
    用户提现表
    """
    tixianid= models.IntegerField(_("提现ID"),unique=True)
    user_id= models.ForeignKey('User',on_delete=models.CASCADE)
    yingHangcard= models.CharField(_('银行卡号'),max_length=19)
    jinE= models.IntegerField(_('提现金额'),default=0)
    tiXiantime = models.DateTimeField(_('提现时间'),default=datetime.datetime.now)

    def __str__(self):
        return str(self.user_id)


class UserLevel(models.Model):
    """
    用户等级
    """
    levelid= models.IntegerField(_("用户等级ID"),unique=True)
    user_id = models.ForeignKey('User',on_delete=models.CASCADE)
    level = models.CharField(_('成长值对应用户等级'),choices=((1,'level1'),(2,'level2')),max_length=20)

    def __str__(self):
        return str(self.id)


class PlayMenthod(models.Model):
    """
    玩法介绍
    """
    playmenthodid= models.IntegerField(_('玩法ID'),unique=True)
    wanFaGroup = models.CharField(_('玩法组'),max_length=20)
    playMethod = models.CharField(_('玩法'),max_length=20)
    playInfo = models.CharField(_('玩法说明'),max_length=200)
    add_time = models.DateTimeField(_('添加时间'),default=datetime.datetime.now)
    beizhu = models.CharField(_('备注'),max_length=200)

    def __str__(self):
        return str(self.id)


class WangZhanInfo(models.Model):
    """
    网站公告
    """
    gonggaoid= models.IntegerField(_('公告ID'),unique=True)
    title = models.CharField(_('公告标题'),max_length=20)
    info = models.CharField(_('公告内容'),max_length=200)