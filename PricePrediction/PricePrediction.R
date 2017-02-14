
# install.packages("forecast")
library(class)
library(dplyr)
library(ggplot2)
library(car) #vif
library(lattice)
library(caret)#train and test
library(kernlab)#svm
library(rpart)#tree learning
library(grid)
library(DMwR)#knnimputation

Sys.getlocale(category = "LC_ALL")
Sys.setlocale(category = "LC_ALL", locale = "zh_CN.UTF-8")

setwd("/Users/cathy/Nodejs/DataAnalytics/Project/Processing")

file <- '/Users/cathy/Nodejs/DataAnalytics/Project/data/SHcommunity.csv'
data <- read.csv(file, header = T, as.is = TRUE )
data0 <- data
head(data0)
summary(data0)
#对于数字型信息price/age/lat/lng/building_count/house_count,其中lat/lng只有一个缺失值，price/building_count/house_count
#的缺失值是0，age的缺失值是2016其中的错误值是<0

data0 <- filter(data0, !is.na(community_id))#data0,去掉community_id为NA的行


##########D3.js展示上海房价所需信息############

data1 <- filter(data0, (district!="") & (plate!="")) #去掉district／plate没有的行 828/21285=3.8%
data1[(data1$age > 100),'age'] <- 0

#data1_price去掉了price为0，去掉缺失值
data1_price <- filter(data1, (price > 0))

#每个区的price情况汇总
districtPrice <- data1_price %>%
  filter(!is.na(community_name))%>%
  group_by(district)%>%
  summarise(
    avrPrice = ceiling(mean(price, na.rm = TRUE)),
    minPrice = min(price, na.rm = TRUE),
    maxPrice = max(price, na.rm = TRUE)
  )%>%
  filter(minPrice > 0)


#################################################分析内容1: 房价预测模型#####################################################
##数据预处理
data1_price_model1 <- filter(data1_price, (age>0) & (house_count >0))
data1_price_model1 <- select(data1_price_model1, price, age, lat, lng, building_count,house_count )
hist(data1_price_model1$age)
hist(data1_price_model1$house_count)
hist(data1_price_model1$building_count)
hist(data1_price_model1$price) #直方图合理，data1_price_model1 8418*6用于预测模型

##预测模型
#~~~linear regression
set.seed(111)
train_control <- trainControl(method = "cv", number = 5)#对数据进行采样
fit.lm <- train(price~., data=data1_price_model1, method="lm", metric="RMSE", 
                preProc=c("center", "scale"), trControl=train_control)
print(fit.lm)
# RMSE      Rsquared 
#20540.31  0.1477599

#~~~logistic regression
set.seed(222)
train_control <- trainControl(method = "cv", number = 5)#对数据进行采样
fit.glm <- train(price~., data=data1_price_model1, method="glm", metric="RMSE",
                 preProc=c("center", "scale"), trControl=train_control)
print(fit.glm)
#RMSE      Rsquared
#20546.05  0.1474363

#~~~knn
set.seed(333)
train_control <- trainControl(method = "cv", number = 5)#对数据进行采样
fit.knn <- train(price~., data=data1_price_model1, method="knn", metric="RMSE", 
                 preProc=c("center", "scale"), trControl=train_control)
print(fit.knn)
#k  RMSE      Rsquared 
#5  12494.90  0.6857731
#7  12326.67  0.6936267
#9  12265.08  0.6968362
#The final value used for the model was k = 9


#~~~tree learning
set.seed(555)
train_control <- trainControl(method = "cv", number = 5)
fit.tree <- train(price~., data=data1_price_model1, method="rpart", metric="RMSE", trControl=train_control)
print(fit.tree)
#cp          RMSE      Rsquared 
#0.08612607  18359.64  0.3177718
#0.12158726  19767.93  0.2103614
#0.16735797  21536.42  0.1513037
#The final value used for the model was cp = 0.08612607

#knn的rmse值最小


##############################################预测房价#####################################################

sapply(data0,function(x){
  sum(x==0,na.rm = TRUE)
})
# price            age            lat            lng         building_count    house_count
# 12269             70              0              0               21              18

##缺失值填补
data1_NA <- data0
data1_NA[data1_NA$age==2016,"age"] <-0
data1_NA[data1_NA$age==0,"age"] <-NA
data1_NA[data1_NA$building_count==0,"building_count"] <-NA
data1_NA[data1_NA$house_count==0,"house_count"] <-NA

data1_num_NA <- data1_NA[,c("price","age","lat", "lng","building_count","house_count" )]
sum(is.na(data1_num_NA))

data1_filling_NA<-knnImputation(data1_num_NA,k=9)
data1_price_prediction <- filter(data1_filling_NA, price==0)


##房价预测
x <- as.matrix(data1_price_model1[,2:6])
y <- as.matrix(data1_price_model1[,1])
fitknn <- knnreg(x, y, k=9)
predictions <- data.frame(price = predict(fitknn, newdata = data1_price_prediction[,2:6]))
data1_price_prediction$price <- predictions
names(data1_price_prediction)[1] <- "price"
colnames(data1_price_prediction[,1])
